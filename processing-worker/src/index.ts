import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { processVideos, analyzeSensitivityForVideo } from "./processor.js";
import { ensureTempDir } from "./utils/fileSystem.js";

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "10000");
const PORT = process.env.WORKER_PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Processing worker is running" });
});

// Manual sensitivity analysis endpoint
app.post("/analyze-sensitivity", async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ message: "videoId is required" });
    }

    console.log(`[INFO] Received sensitivity analysis request for: ${videoId}`);

    // Run analysis in background
    analyzeSensitivityForVideo(videoId).catch((error) => {
      console.error(
        `[ERROR] Sensitivity analysis failed for ${videoId}:`,
        error
      );
    });

    res.status(200).json({
      message: "Sensitivity analysis started",
      videoId,
    });
  } catch (error) {
    console.error("[ERROR] /analyze-sensitivity:", error);
    res.status(500).json({ message: "Failed to start analysis", error });
  }
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log("[SUCCESS] MongoDB Connected:", mongoose.connection.host);
  } catch (error) {
    console.error("[ERROR] MongoDB connection error:", error);
    process.exit(1);
  }
}

async function startWorker() {
  console.log("[INFO] Starting Pulse Video Processing Worker...");

  // Connect to database
  await connectDB();

  // Ensure temp directory exists
  await ensureTempDir();

  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`[INFO] Worker HTTP server listening on port ${PORT}`);
  });

  console.log(`[INFO] Polling for videos every ${POLL_INTERVAL}ms`);

  // Start processing loop
  while (true) {
    try {
      await processVideos();
    } catch (error) {
      console.error("[ERROR] Error in processing loop:", error);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[INFO] Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[INFO] Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

startWorker();
