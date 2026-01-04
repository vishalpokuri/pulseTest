import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getCurrentUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";
import { isAdmin } from "../middleware/rbac.js";

const router = Router();

// Current user profile (any authenticated user)
router.get("/me", authMiddleware, getCurrentUser);

// Admin-only routes
router.get("/", authMiddleware, isAdmin, getAllUsers);
router.get("/:id", authMiddleware, isAdmin, getUserById);
router.put("/:id/role", authMiddleware, isAdmin, updateUserRole);
router.delete("/:id", authMiddleware, isAdmin, deleteUser);

export default router;
