import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
  userId: mongoose.Types.ObjectId; // Owner of the video
  videoId: string; // Unique ID for organizing ABR content
  title: string;
  s3Key: string; // Path to original file
  s3Url: string;
  thumbnailUrl?: string; // URL to thumbnail image
  masterPlaylistUrl?: string; // URL to master.m3u8 for ABR streaming
  status: "uploading" | "processing" | "completed" | "failed";
  sensitivity: number; // Percentage 0-100
  sensitivityStatus: "pending" | "analyzing" | "completed" | "failed"; // Separate status for sensitivity analysis
  fileSize: number;
  duration: number;
  resolutions: string[]; // e.g., ["1080p", "720p", "480p", "360p"]
}

const videoSchema = new Schema<IVideo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    videoId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    s3Key: {
      type: String,
      required: true,
      unique: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    masterPlaylistUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["uploading", "processing", "completed", "failed"],
      default: "uploading",
    },
    sensitivity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sensitivityStatus: {
      type: String,
      enum: ["pending", "analyzing", "completed", "failed"],
      default: "pending",
    },
    fileSize: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    resolutions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
videoSchema.index({ userId: 1, status: 1 });
videoSchema.index({ userId: 1, sensitivity: 1 });
videoSchema.index({ userId: 1, sensitivityStatus: 1 });
videoSchema.index({ userId: 1, createdAt: -1 });

export const Video = mongoose.model<IVideo>("Video", videoSchema);
