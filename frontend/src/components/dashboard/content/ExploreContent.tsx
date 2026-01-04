import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVideo } from "@/contexts/VideoContext";
import { useSocket } from "@/contexts/SocketContext";
import { Play, Eye } from "lucide-react";
import { formatDuration, getSensitivityColor } from "@/utils/videoUtils";

export default function ExploreContent() {
  const { videos, fetchVideos, isLoading } = useVideo();
  const { setOnVideoComplete } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Auto-refresh when HLS processing completes
  useEffect(() => {
    setOnVideoComplete(() => {
      console.log("[INFO] HLS processing complete, refreshing videos...");
      fetchVideos();
    });
  }, [setOnVideoComplete, fetchVideos]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Eye className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Videos Yet</h3>
        <p className="text-muted-foreground">
          Upload your first video to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Explore</h2>
        <p className="text-sm text-muted-foreground">
          {videos.length} {videos.length === 1 ? "video" : "videos"}
        </p>
      </div>

      {/* YouTube-style Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {videos.map((video) => {
          return (
            <div
              key={video._id}
              className="cursor-pointer group"
              onClick={() => navigate(`/player/${video._id}`)}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-3">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                  {video.title}
                </h3>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(video.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  {/* Sensitivity Indicator */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-semibold ${getSensitivityColor(
                        video.sensitivity
                      )}`}
                    >
                      {video.sensitivityStatus == "completed" &&
                        `${video.sensitivity}%`}
                    </span>
                    {video.sensitivityStatus == "completed" && (
                      <span className="text-muted-foreground">sensitive</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
