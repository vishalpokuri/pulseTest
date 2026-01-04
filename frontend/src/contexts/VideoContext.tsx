import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import type { Video, UploadProgress } from "@/types/video";
import { getVideoDuration } from "@/utils/videoUtils";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface VideoContextType {
  videos: Video[];
  uploadProgress: UploadProgress;
  isLoading: boolean;
  uploadVideo: (
    file: File,
    title: string,
    onComplete?: () => void
  ) => Promise<Video>;
  fetchVideos: () => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  getVideoById: (id: string) => Promise<Video | null>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    isUploading: false,
    currentFile: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Upload video
  const uploadVideo = useCallback(
    async (file: File, title: string, onComplete?: () => void) => {
      const uploadToast = toast.loading("Preparing upload...");

      try {
        setUploadProgress({
          percentage: 0,
          isUploading: true,
          currentFile: file.name,
        });

        // Step 1: Get presigned URL
        const token = localStorage.getItem("accessToken");
        const presignedResponse = await fetch(
          `${API_URL}/videos/presigned-upload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
            }),
          }
        );

        if (!presignedResponse.ok) {
          const error = await presignedResponse.json();
          throw new Error(error.message || "Failed to get upload URL");
        }

        const { presignedUrl, key, videoId } = await presignedResponse.json();

        // Step 2: Upload to S3 with progress tracking
        toast.loading("Uploading to S3...", { id: uploadToast });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentage = Math.round((e.loaded / e.total) * 100);
              setUploadProgress((prev) => ({ ...prev, percentage }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload was aborted"));
          });

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // Step 3: Get video duration and save metadata
        toast.loading("Saving video metadata...", { id: uploadToast });

        const videoDuration = await getVideoDuration(file);

        const metadataResponse = await fetch(`${API_URL}/videos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            videoId,
            title,
            s3Key: key,
            fileSize: file.size,
            duration: videoDuration,
          }),
        });

        if (!metadataResponse.ok) {
          const error = await metadataResponse.json();
          throw new Error(error.message || "Failed to save video metadata");
        }

        const result = await metadataResponse.json();

        // Add new video to the list
        if (result.video) {
          setVideos((prev) => [result.video, ...prev]);
        }

        toast.success("Video uploaded successfully!", { id: uploadToast });

        // Refresh video list
        await fetchVideos();

        // Call completion callback (for navigation)
        if (onComplete) {
          onComplete();
        }

        // Return the uploaded video
        return result.video;
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to upload video. Please try again.";
        toast.error(errorMessage, { id: uploadToast });
        throw error;
      } finally {
        setUploadProgress({
          percentage: 0,
          isUploading: false,
          currentFile: null,
        });
      }
    },
    []
  );

  // Fetch all videos
  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get single video by ID
  const getVideoById = useCallback(
    async (id: string): Promise<Video | null> => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}/videos/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch video");
        }

        const data = await response.json();
        return data.video;
      } catch (error) {
        console.error("Error fetching video:", error);
        toast.error("Failed to load video");
        return null;
      }
    },
    []
  );

  // Delete video
  const deleteVideo = useCallback(async (id: string) => {
    const deleteToast = toast.loading("Deleting video...");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/videos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      // Remove from local state
      setVideos((prev) => prev.filter((video) => video._id !== id));

      toast.success("Video deleted successfully", { id: deleteToast });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video", { id: deleteToast });
      throw error;
    }
  }, []);

  const value: VideoContextType = {
    videos,
    uploadProgress,
    isLoading,
    uploadVideo,
    fetchVideos,
    deleteVideo,
    getVideoById,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};
