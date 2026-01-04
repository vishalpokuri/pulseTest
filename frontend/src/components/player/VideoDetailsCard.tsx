import { Calendar, FileVideo, PlayCircleIcon } from "lucide-react";
import { formatDuration } from "@/utils/videoUtils";

interface VideoDetailsCardProps {
  video: any;
}

export default function VideoDetailsCard({ video }: VideoDetailsCardProps) {
  return (
    <div className="bg-muted rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Video Details</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p className="text-xs font-medium">Upload Date</p>
            </div>
            <p className="text-sm font-medium">
              {new Date(video.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileVideo className="h-4 w-4" />
              <p className="text-xs font-medium">Duration</p>
            </div>
            <p className="text-sm font-medium">
              {formatDuration(video.duration)}
            </p>
          </div>
        </div>

        {video.masterPlaylistUrl && (
          <div className="flex flex-row gap-2 items-center">
            <PlayCircleIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">
              HLS adaptive streaming enabled
            </p>
          </div>
        )}

        {video.thumbnailUrl && (
          <div>
            <p className="text-sm font-medium mb-2">Thumbnail</p>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}
