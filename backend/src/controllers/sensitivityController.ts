import type { Request, Response } from "express";
import { Video } from "../models/videoSchema.js";
import { Types } from "mongoose";

/**
 * Trigger sensitivity analysis for a video
 * This makes an HTTP request to the processing worker
 */
export const analyzeSensitivity = async (
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

    if (video.status !== "completed") {
      res.status(400).json({
        message: "Video must be processed before analyzing sensitivity",
      });
      return;
    }

    // Update status to analyzing immediately
    console.log(
      `[INFO] Updating sensitivityStatus to 'analyzing' for video ID: ${id}`
    );
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      {
        sensitivityStatus: "analyzing",
      },
      { new: true }
    );
    console.log(`[SUCCESS] Status updated:`, {
      videoId: updatedVideo?.videoId,
      sensitivityStatus: updatedVideo?.sensitivityStatus,
    });

    // Send request to processing worker
    const workerUrl =
      process.env.WORKER_URL || "http://localhost:5000/analyze-sensitivity";

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: video.videoId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to trigger sensitivity analysis");
    }

    res.status(200).json({
      message: "Sensitivity analysis started",
      videoId: video.videoId,
    });
  } catch (error) {
    console.error("[ERROR] analyzeSensitivity:", error);
    res.status(500).json({
      message: "Failed to start sensitivity analysis",
      error,
    });
  }
};
