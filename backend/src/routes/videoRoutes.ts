import { Router } from "express";
import {
  generatePresignedUrl,
  createVideo,
  getUserVideos,
  getVideoById,
  deleteVideo,
} from "../controllers/videoController.js";
import { analyzeSensitivity } from "../controllers/sensitivityController.js";
import { authMiddleware } from "../middleware/auth.js";
import { isViewer, isEditor } from "../middleware/rbac.js";

const router = Router();

// All video routes require authentication
router.use(authMiddleware);

// Generate presigned URL for upload (Editor and Admin only)
router.post("/presigned-upload", isEditor, generatePresignedUrl);

// Save video metadata after upload (Editor and Admin only)
router.post("/", isEditor, createVideo);

// Get all videos (All authenticated users)
router.get("/", isViewer, getUserVideos);

// Get single video (All authenticated users)
router.get("/:id", isViewer, getVideoById);

// Delete video (Editor and Admin only - with ownership check in controller)
router.delete("/:id", isEditor, deleteVideo);

// Trigger sensitivity analysis (Editor and Admin only - with ownership check in controller)
router.post("/:id/analyze-sensitivity", isEditor, analyzeSensitivity);

export default router;
