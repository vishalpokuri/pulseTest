import type { Request, Response, NextFunction } from "express";
import { User } from "../models/userSchema.js";

/**
 * RBAC Middleware - Check if user has required role
 * Usage: checkRole(['admin', 'editor'])
 */
export const checkRole = (allowedRoles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // @ts-ignore - userId added by authMiddleware
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Fetch user from database to get role
      const user = await User.findById(userId).select("role");

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
          userRole: user.role,
        });
        return;
      }

      // @ts-ignore - Add role to request for further use
      req.userRole = user.role;

      next();
    } catch (error) {
      console.error("RBAC error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
};

/**
 * Convenience middleware for common role checks
 */
export const isAdmin = checkRole(["admin"]);
export const isEditor = checkRole(["admin", "editor"]);
export const isViewer = checkRole(["admin", "editor", "viewer"]);
