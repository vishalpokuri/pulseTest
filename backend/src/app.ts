import "dotenv/config";
import express, { type Request, type Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Socket.io setup with CORS
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`[INFO] Client connected: ${socket.id}`);

  // Handle video progress updates from processing worker
  socket.on("video:progress", (data) => {
    console.log(
      `[INFO] Progress: ${data.videoId} - ${data.message} (${data.progress}%)`
    );
    // Broadcast to all connected clients
    io.emit("video:progress", data);
  });

  socket.on("video:complete", (data) => {
    console.log(`[SUCCESS] Completed: ${data.videoId}`);
    io.emit("video:complete", data);
  });

  socket.on("video:failed", (data) => {
    console.log(`[ERROR] Failed: ${data.videoId} - ${data.error}`);
    io.emit("video:failed", data);
  });

  socket.on("disconnect", () => {
    console.log(`[INFO] Client disconnected: ${socket.id}`);
  });
});

// CORS - Must be before other middleware
app.use(
  cors({
    origin: "*",
  })
);

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Basic health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Pulse API Server is running" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`[INFO] Server is running on port ${PORT}`);
      console.log(`[INFO] Socket.io ready for real-time updates`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
