import mongoose, { Document, Schema } from "mongoose";

export interface IVideo extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: string;
  title: string;
  s3Key: string;
  s3Url: string;
  thumbnailUrl?: string;
  masterPlaylistUrl?: string;
  status: "uploading" | "processing" | "completed" | "failed";
  sensitivity: number;
  sensitivityStatus: "pending" | "analyzing" | "completed" | "failed";
  fileSize: number;
  duration: number;
  resolutions: string[];
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
  { timestamps: true }
);

// Indexes for efficient queries
videoSchema.index({ status: 1 });
videoSchema.index({ createdAt: -1 });

export const Video = mongoose.model<IVideo>("Video", videoSchema);
