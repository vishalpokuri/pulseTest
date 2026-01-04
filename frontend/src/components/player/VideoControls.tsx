import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react";
import { formatDuration } from "@/utils/videoUtils";

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentQuality: string;
  availableQualities: string[];
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  onQualityChange: (quality: string) => void;
}

export default function VideoControls({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  volume,
  currentQuality,
  availableQualities,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSeek,
  onFullscreen,
  onQualityChange,
}: VideoControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Progress Bar */}
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600 mb-2"
      />
      <div className="flex justify-between text-xs text-white mb-3">
        <span>{formatDuration(Math.floor(currentTime))}</span>
        <span>{formatDuration(Math.floor(duration))}</span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className="text-white hover:text-red-500 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-7 w-7" fill="white" />
            ) : (
              <Play className="h-7 w-7" fill="white" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onMuteToggle}
              className="text-white hover:text-red-500 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {availableQualities.length > 0 && (
            <div className="relative group/quality">
              <button className="text-white hover:text-red-500 transition-colors flex items-center gap-1 text-sm">
                <Settings className="h-5 w-5" />
                <span>{currentQuality}</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-md overflow-hidden opacity-0 group-hover/quality:opacity-100 transition-opacity">
                <button
                  onClick={() => onQualityChange("auto")}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-red-600/20 ${
                    currentQuality === "auto" ? "text-red-500" : "text-white"
                  }`}
                >
                  Auto
                </button>
                {availableQualities.map((quality) => (
                  <button
                    key={quality}
                    onClick={() => onQualityChange(quality)}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-red-600/20 ${
                      currentQuality === quality ? "text-red-500" : "text-white"
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onFullscreen}
            className="text-white hover:text-red-500 transition-colors"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
