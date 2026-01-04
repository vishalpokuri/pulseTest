import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerHLSProps {
  masterPlaylistUrl?: string;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onPlayPause: () => void;
  onQualitiesAvailable: (qualities: string[]) => void;
  onQualityChanged: (quality: string, isAuto: boolean) => void;
  currentQuality: string;
}

export default function VideoPlayerHLS({
  masterPlaylistUrl,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onPlayPause,
  onQualitiesAvailable,
  onQualityChanged,
  currentQuality,
}: VideoPlayerHLSProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!masterPlaylistUrl || !videoRef.current) return;

    const videoElement = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });

      hlsRef.current = hls;
      hls.loadSource(masterPlaylistUrl);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level) => `${level.height}p`);
        onQualitiesAvailable(levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls.levels[data.level];
        if (currentQuality === "auto") {
          onQualityChanged(`${level.height}p`, true);
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = masterPlaylistUrl;
    }
  }, [
    masterPlaylistUrl,
    currentQuality,
    onQualitiesAvailable,
    onQualityChanged,
  ]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full"
      onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => onLoadedMetadata(e.currentTarget.duration)}
      onPlay={onPlay}
      onPause={onPause}
      onClick={onPlayPause}
    />
  );
}
