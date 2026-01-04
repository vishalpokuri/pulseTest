import type { Request, Response } from "express";
import { getPresignedUploadUrl } from "../utils/getPresignedUrl.js";
import { deleteVideoFolder } from "../utils/deleteObject.js";
import { Video } from "../models/videoSchema.js";
import { Types } from "mongoose";

// Generate presigned URL for video upload
export const generatePresignedUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      res.status(400).json({
        message: "Filename and content type are required",
      });
      return;
    }

    // Validate content type (only accept video formats)
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
      "video/webm",
    ];

    if (!allowedTypes.includes(contentType)) {
      res.status(400).json({
        message: "Invalid content type. Only video files are allowed.",
      });
      return;
    }

    const result = await getPresignedUploadUrl({
      fileName: filename,
      contentType,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
};

// Save video metadata after successful upload (presignedURL upload)
export const createVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { videoId, title, s3Key, fileSize, duration } = req.body;
    // @ts-ignore - userId added by authMiddleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!videoId || !title || !s3Key || !fileSize || !duration) {
      res.status(400).json({
        message:
          "Video ID, title, S3 key, file size, and duration are required",
      });
      return;
    }

    // Construct S3 URL for original file
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Master playlist URL will be populated after ABR processing
    const masterPlaylistUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/videos/${videoId}/master.m3u8`;

    const video = await Video.create({
      userId, // Associate video with user
      videoId,
      title,
      s3Key,
      s3Url,
      masterPlaylistUrl,
      fileSize,
      duration,
      status: "processing", // Start processing for ABR conversion
      sensitivity: 0, // Will be analyzed during processing
      sensitivityStatus: "pending", // Initialize sensitivity analysis status
      resolutions: [], // Will be populated after adaptive bitrate conversion
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      video: {
        _id: video._id,
        videoId: video.videoId,
        title: video.title,
        status: video.status,
        sensitivity: video.sensitivity,
        resolutions: video.resolutions,
      },
    });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({ message: "Failed to save video metadata" });
  }
};

// Get all videos for the logged-in user
export const getUserVideos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // @ts-ignore - userId added by authMiddleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const videos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

// Get single video by ID
export const getVideoById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore - userId added by authMiddleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const video = await Video.findOne({
      _id: new Types.ObjectId(id),
      userId,
    }).select("-__v");

    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    res.status(200).json({ video });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ message: "Failed to fetch video" });
  }
};

// Delete video
export const deleteVideo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // @ts-ignore - userId added by authMiddleware
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find video and check ownership
    const video = await Video.findOne({ _id: new Types.ObjectId(id), userId });

    if (!video) {
      res.status(404).json({ message: "Video not found or access denied" });
      return;
    }

    // Delete from database
    await Video.findByIdAndDelete(id);

    // Delete entire video folder from S3 (includes original + all ABR variants)
    try {
      await deleteVideoFolder(video.videoId);
    } catch (s3Error) {
      console.error("Failed to delete video from S3:", s3Error);
    }

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Failed to delete video" });
  }
};
