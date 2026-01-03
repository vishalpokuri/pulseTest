import mongoose from "mongoose";
const videoSchema = new mongoose.Schema(
  {
    videoTitle: {
      type: String,
    },
    // S3 uri
    videoURL: {
      type: String,
    },
    processingStatus: {
      type: String,
      enum: ["notStarted", "completed", "failed"],
    },
    sensitivity: {
      type: Number,
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

export const Video = mongoose.model("Video", videoSchema);
