import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  resolution: string;
  videoBitrate: string;
  audioBitrate: string;
}

/**
 * Generate thumbnail from video at 1 second mark
 */
export function generateThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [1],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: "640x?",
      })
      .on("end", () => {
        console.log(`[SUCCESS] Thumbnail generated: ${outputPath}`);
        resolve();
      })
      .on("error", (err) => {
        console.error("[ERROR] Thumbnail generation failed:", err);
        reject(err);
      });
  });
}

/**
 * Transcode video to specific resolution with HLS segmentation
 */
export function transcodeToResolution(
  options: TranscodeOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { inputPath, outputDir, resolution, videoBitrate, audioBitrate } =
      options;

    const resolutionDir = path.join(outputDir, resolution);
    if (!fs.existsSync(resolutionDir)) {
      fs.mkdirSync(resolutionDir, { recursive: true });
    }

    const playlistPath = path.join(resolutionDir, "playlist.m3u8");

    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-c:a aac",
        `-b:v ${videoBitrate}`,
        `-b:a ${audioBitrate}`,
        "-preset fast",
        "-g 48",
        "-sc_threshold 0",
        "-f hls",
        "-hls_time 4",
        "-hls_playlist_type vod",
        `-hls_segment_filename ${path.join(resolutionDir, "segment%03d.ts")}`,
      ])
      .output(playlistPath)
      .on("start", (cmd) => {
        console.log(`[INFO] Transcoding ${resolution}: ${cmd}`);
      })
      .on("progress", (progress) => {
        if (progress.percent) {
          console.log(`   ${resolution}: ${Math.round(progress.percent)}%`);
        }
      })
      .on("end", () => {
        console.log(`[SUCCESS] Completed ${resolution}`);
        resolve(playlistPath);
      })
      .on("error", (err) => {
        console.error(`[ERROR] Transcoding ${resolution} failed:`, err);
        reject(err);
      })
      .run();
  });
}

/**
 * Generate master HLS playlist
 */
export function generateMasterPlaylist(
  outputDir: string,
  resolutions: Array<{ name: string; bandwidth: number }>
): string {
  const masterPlaylistPath = path.join(outputDir, "master.m3u8");

  let content = "#EXTM3U\n#EXT-X-VERSION:3\n\n";

  for (const res of resolutions) {
    content += `#EXT-X-STREAM-INF:BANDWIDTH=${res.bandwidth},RESOLUTION=${res.name}\n`;
    content += `${res.name}/playlist.m3u8\n\n`;
  }

  fs.writeFileSync(masterPlaylistPath, content);
  console.log(`[SUCCESS] Master playlist created: ${masterPlaylistPath}`);

  return masterPlaylistPath;
}

/**
 * Get video metadata using ffprobe
 */
export function getVideoMetadata(inputPath: string): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video"
      );
      if (!videoStream) {
        reject(new Error("No video stream found"));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
      });
    });
  });
}
