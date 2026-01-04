import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "iLovePulseGen";

interface JWTPayload {
  userId: string;
  username: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // @ts-ignore - Add userId to request object
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
