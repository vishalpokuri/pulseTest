import { useEffect } from "react";
import { Play, Trash2, Clock, HardDrive } from "lucide-react";
import { useVideo } from "@/contexts/VideoContext";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatFileSize,
  formatDuration,
  getStatusColor,
  getSensitivityColor,
} from "@/utils/videoUtils";

export default function VideoList() {
  const { videos, fetchVideos, deleteVideo, isLoading } = useVideo();
  const { processingProgress } = useSocket();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      await deleteVideo(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Play className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No videos uploaded yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload your first video to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Videos</CardTitle>
        <CardDescription>
          Manage and monitor your uploaded videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => {
            const progress = processingProgress.get(video.videoId);

            return (
              <div
                key={video._id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {video.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          video.status
                        )}`}
                      >
                        {video.status}
                      </span>
                    </div>

                    {/* Processing Progress Bar */}
                    {progress && video.status === "processing" && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{progress.message}</span>
                          <span>{progress.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Video Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(video.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-4 w-4" />
                        <span>{formatFileSize(video.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Sensitivity:</span>
                        <span
                          className={`font-semibold ${getSensitivityColor(
                            video.sensitivity
                          )}`}
                        >
                          {video.sensitivity}%
                        </span>
                      </div>
                    </div>

                    {/* Resolutions */}
                    {video.resolutions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">
                          Available:{" "}
                        </span>
                        {video.resolutions.map((res, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded mr-1"
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Upload Date */}
                    <p className="text-xs text-muted-foreground mt-2">
                      Uploaded: {new Date(video.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(video.s3Url, "_blank")}
                      title="Play video"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(video._id)}
                      title="Delete video"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
