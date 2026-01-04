import { Video } from "./models/Video.js";
import { downloadFromS3, uploadToS3 } from "./utils/s3Operations.js";
import { getJobPaths, cleanupJobDir } from "./utils/fileSystem.js";
import {
  generateThumbnail,
  transcodeToResolution,
  generateMasterPlaylist,
  getVideoMetadata,
} from "./utils/ffmpeg.js";
import { analyzeSensitivity } from "./utils/sensitivityAnalysis.js";
import { emitProgress, emitComplete, emitFailure } from "./utils/socket.js";
import path from "path";
import fs from "fs";

// ABR configurations for different resolutions
const ABR_CONFIGS = [
  {
    name: "240p",
    videoBitrate: "500k",
    audioBitrate: "64k",
    bandwidth: 564000,
    maxHeight: 240,
  },
  {
    name: "360p",
    videoBitrate: "800k",
    audioBitrate: "96k",
    bandwidth: 896000,
    maxHeight: 360,
  },
  {
    name: "480p",
    videoBitrate: "1400k",
    audioBitrate: "128k",
    bandwidth: 1528000,
    maxHeight: 480,
  },
  {
    name: "720p",
    videoBitrate: "2800k",
    audioBitrate: "128k",
    bandwidth: 2928000,
    maxHeight: 720,
  },
];

/**
 * Process a single video
 */
async function processVideo(video: any): Promise<void> {
  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[INFO] Processing: ${video.title} (${video.videoId})`);
  console.log(`${"=".repeat(60)}\n`);

  const originalFileName = path.basename(video.s3Key);
  const paths = getJobPaths(video.videoId, originalFileName);

  try {
    // Step 1: Download original video from S3
    console.log("[INFO] Step 1: Downloading from S3...");
    emitProgress({
      videoId: video.videoId,
      step: "download",
      progress: 10,
      message: "Downloading video from S3...",
    });
    await downloadFromS3(video.s3Key, paths.inputVideo);

    // Step 2: Get video metadata
    console.log("\n[INFO] Step 2: Analyzing video metadata...");
    emitProgress({
      videoId: video.videoId,
      step: "metadata",
      progress: 20,
      message: "Analyzing video metadata...",
    });
    const metadata = await getVideoMetadata(paths.inputVideo);
    console.log(`   Duration: ${metadata.duration}s`);
    console.log(`   Resolution: ${metadata.width}x${metadata.height}`);

    // Step 3: Generate thumbnail
    console.log("\n[INFO] Step 3: Generating thumbnail...");
    emitProgress({
      videoId: video.videoId,
      step: "thumbnail",
      progress: 30,
      message: "Generating thumbnail...",
    });
    await generateThumbnail(paths.inputVideo, paths.thumbnail);
    const thumbnailS3Key = `videos/${video.videoId}/thumbnail.jpg`;
    const thumbnailUrl = await uploadToS3(
      paths.thumbnail,
      thumbnailS3Key,
      "image/jpeg"
    );

    // Step 4: Determine which resolutions to generate based on source quality
    console.log("\n[INFO] Step 4: Transcoding to ABR formats...");
    emitProgress({
      videoId: video.videoId,
      step: "transcode",
      progress: 40,
      message: "Preparing transcoding...",
    });
    const applicableConfigs = ABR_CONFIGS.filter(
      (config) => config.maxHeight <= metadata.height
    );

    if (applicableConfigs.length === 0) {
      console.log(
        "   ⚠️  Source resolution too low for ABR, using original only"
      );
      applicableConfigs.push(ABR_CONFIGS[0]); // At least generate 240p
    }

    console.log(
      `   Generating ${applicableConfigs.length} quality levels:`,
      applicableConfigs.map((c) => c.name).join(", ")
    );

    // Create output directory
    if (!fs.existsSync(paths.outputDir)) {
      fs.mkdirSync(paths.outputDir, { recursive: true });
    }

    // Step 5: Transcode to each resolution
    const resolutionInfo = [];
    for (let i = 0; i < applicableConfigs.length; i++) {
      const config = applicableConfigs[i];
      const progressPercent = 40 + ((i + 1) / applicableConfigs.length) * 35;

      emitProgress({
        videoId: video.videoId,
        step: "transcode",
        progress: Math.round(progressPercent),
        message: `Transcoding to ${config.name} (${i + 1}/${
          applicableConfigs.length
        })...`,
      });

      await transcodeToResolution({
        inputPath: paths.inputVideo,
        outputDir: paths.outputDir,
        resolution: config.name,
        videoBitrate: config.videoBitrate,
        audioBitrate: config.audioBitrate,
      });

      resolutionInfo.push({
        name: config.name,
        bandwidth: config.bandwidth,
      });
    }

    // Step 7: Generate master playlist
    console.log("\n[INFO] Step 7: Generating master playlist...");
    const masterPlaylistPath = generateMasterPlaylist(
      paths.outputDir,
      resolutionInfo
    );

    // Step 8: Upload all transcoded files to S3
    console.log("\n[INFO] Step 8: Uploading to S3...");
    emitProgress({
      videoId: video.videoId,
      step: "upload",
      progress: 85,
      message: "Uploading processed files to S3...",
    });
    const uploadPromises: Promise<any>[] = [];

    // Upload master playlist
    const masterS3Key = `videos/${video.videoId}/master.m3u8`;
    uploadPromises.push(
      uploadToS3(
        masterPlaylistPath,
        masterS3Key,
        "application/vnd.apple.mpegurl"
      )
    );

    // Upload each resolution folder
    for (const config of applicableConfigs) {
      const resolutionDir = path.join(paths.outputDir, config.name);
      const files = fs.readdirSync(resolutionDir);

      for (const file of files) {
        const localPath = path.join(resolutionDir, file);
        const s3Key = `videos/${video.videoId}/${config.name}/${file}`;
        const contentType = file.endsWith(".m3u8")
          ? "application/vnd.apple.mpegurl"
          : "video/MP2T";

        uploadPromises.push(uploadToS3(localPath, s3Key, contentType));
      }
    }

    await Promise.all(uploadPromises);

    // Step 6: Update database
    console.log("\n[INFO] Step 6: Updating database...");
    emitProgress({
      videoId: video.videoId,
      step: "finalize",
      progress: 95,
      message: "Finalizing...",
    });
    const masterPlaylistUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${masterS3Key}`;

    await Video.findByIdAndUpdate(video._id, {
      status: "completed",
      thumbnailUrl,
      masterPlaylistUrl,
      resolutions: resolutionInfo.map((r) => r.name),
      // Sensitivity will be updated separately via manual trigger
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n[SUCCESS] Processing complete in ${duration}s`);
    console.log(`   Thumbnail: ${thumbnailUrl}`);
    console.log(`   Master Playlist: ${masterPlaylistUrl}`);
    console.log(
      `   Resolutions: ${resolutionInfo.map((r) => r.name).join(", ")}`
    );
    console.log(`   Sensitivity: Not analyzed (manual trigger required)`);

    // Emit completion event
    emitComplete(video.videoId);
  } catch (error) {
    console.error("\n[ERROR] PROCESSING FAILED:", error);

    // Update video status to failed
    await Video.findByIdAndUpdate(video._id, {
      status: "failed",
    });

    // Emit failure event
    emitFailure(
      video.videoId,
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    // Cleanup temp files
    console.log("\n[INFO] Cleaning up temporary files...");
    cleanupJobDir(video.videoId);
  }
}

/**
 * Analyze sensitivity for a specific video (manual trigger)
 */
export async function analyzeSensitivityForVideo(
  videoId: string
): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[INFO] Analyzing sensitivity for video: ${videoId}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const video = await Video.findOne({ videoId });
    if (!video) {
      throw new Error("Video not found");
    }

    // Download video for analysis
    const originalFileName = path.basename(video.s3Key);
    const paths = getJobPaths(video.videoId, originalFileName);

    console.log("[INFO] Downloading video for analysis...");
    await downloadFromS3(video.s3Key, paths.inputVideo);

    // Get duration
    const metadata = await getVideoMetadata(paths.inputVideo);

    // Analyze with progress updates
    console.log("[INFO] Starting frame extraction and analysis...");
    const sensitivityScore = await analyzeSensitivity(
      paths.inputVideo,
      metadata.duration,
      video.videoId
    );

    // Update database
    console.log(
      `[INFO] Updating database: sensitivity=${sensitivityScore}, sensitivityStatus=completed`
    );
    const updatedVideo = await Video.findByIdAndUpdate(
      video._id,
      {
        sensitivity: sensitivityScore,
        sensitivityStatus: "completed",
      },
      { new: true }
    );
    console.log(`[SUCCESS] Database updated:`, {
      videoId: updatedVideo?.videoId,
      sensitivity: updatedVideo?.sensitivity,
      sensitivityStatus: updatedVideo?.sensitivityStatus,
    });

    console.log(
      `\n[SUCCESS] Sensitivity analysis complete: ${sensitivityScore}%`
    );

    // Cleanup
    cleanupJobDir(video.videoId);
  } catch (error) {
    console.error("\n[ERROR] Sensitivity analysis failed:", error);

    // Update status to failed
    const video = await Video.findOne({ videoId });
    if (video) {
      await Video.findByIdAndUpdate(video._id, {
        sensitivityStatus: "failed",
      });
    }

    throw error;
  }
}

/**
 * Main processing loop
 */
export async function processVideos(): Promise<void> {
  try {
    // Find videos with "processing" status
    const videos = await Video.find({ status: "processing" }).limit(1);

    if (videos.length === 0) {
      // console.log("[INFO] No videos to process...");
      return;
    }

    console.log(`\n[INFO] Found ${videos.length} video(s) to process`);

    // Process videos one at a time
    for (const video of videos) {
      await processVideo(video);
    }
  } catch (error) {
    console.error("[ERROR] Error in processVideos:", error);
  }
}
