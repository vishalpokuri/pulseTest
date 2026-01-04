import { io as socketClient } from "socket.io-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// Connect to backend Socket.io server
export const socket = socketClient(BACKEND_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("[SUCCESS] Connected to backend Socket.io");
});

socket.on("disconnect", () => {
  console.log("[WARNING] Disconnected from backend Socket.io");
});

socket.on("connect_error", (error) => {
  console.error("[ERROR] Socket connection error:", error.message);
});

/**
 * Emit video processing progress
 */
export function emitProgress(data: {
  videoId: string;
  step: string;
  progress: number;
  message: string;
}) {
  socket.emit("video:progress", data);
}

/**
 * Emit video processing completion
 */
export function emitComplete(videoId: string) {
  socket.emit("video:complete", { videoId });
}

/**
 * Emit video processing failure
 */
export function emitFailure(videoId: string, error: string) {
  socket.emit("video:failed", { videoId, error });
}
