import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL?.replace("/api", "") ||
  "http://localhost:4000";

interface ProcessingProgress {
  videoId: string;
  step: string;
  progress: number;
  message: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  processingProgress: Map<string, ProcessingProgress>;
  onVideoComplete?: (videoId: string) => void;
  setOnVideoComplete: (callback: (videoId: string) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<
    Map<string, ProcessingProgress>
  >(new Map());
  const onVideoCompleteRef = useRef<((videoId: string) => void) | undefined>(
    undefined
  );

  const setOnVideoComplete = (callback: (videoId: string) => void) => {
    onVideoCompleteRef.current = callback;
  };

  useEffect(() => {
    const socketInstance = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      console.log("[INFO] Connected to Socket.io server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("[INFO] Disconnected from Socket.io server");
      setIsConnected(false);
    });

    // Listen for video processing progress
    socketInstance.on("video:progress", (data: ProcessingProgress) => {
      console.log("[INFO] Progress update:", data);
      setProcessingProgress((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.videoId, data);
        return newMap;
      });
    });

    // Listen for video completion
    socketInstance.on("video:complete", (data: { videoId: string }) => {
      console.log("[SUCCESS] Video completed:", data.videoId);
      setProcessingProgress((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.videoId);
        return newMap;
      });

      // Trigger callback if set
      if (onVideoCompleteRef.current) {
        onVideoCompleteRef.current(data.videoId);
      }
    });

    // Listen for video failure
    socketInstance.on(
      "video:failed",
      (data: { videoId: string; error: string }) => {
        console.log("[ERROR] Video failed:", data.videoId, data.error);
        setProcessingProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.videoId);
          return newMap;
        });
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        processingProgress,
        onVideoComplete: onVideoCompleteRef.current,
        setOnVideoComplete,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
