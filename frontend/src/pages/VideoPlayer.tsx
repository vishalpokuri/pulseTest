import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useVideo } from "@/contexts/VideoContext";
import { useSocket } from "@/contexts/SocketContext";
import { Button } from "@/components/ui/button";
import VideoControls from "@/components/player/VideoControls";
import SensitivityAnalysisCard from "@/components/player/SensitivityAnalysisCard";
import VideoDetailsCard from "@/components/player/VideoDetailsCard";

export default function VideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { videos, fetchVideos, deleteVideo } = useVideo();
  const { processingProgress } = useSocket();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [video, setVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch videos on mount
  useEffect(() => {
    if (videos.length === 0) {
      fetchVideos();
    }
  }, [videos, fetchVideos]);

  // Find current video
  useEffect(() => {
    if (videos.length > 0 && id) {
      const foundVideo = videos.find((v) => v._id === id || v.videoId === id);
      if (foundVideo) {
        setVideo(foundVideo);
        setIsLoading(false);
      }
    }
  }, [videos, id]);

  // Refetch when analysis completes
  useEffect(() => {
    if (video && isAnalyzing) {
      const progress = processingProgress.get(video.videoId);
      if (
        progress &&
        progress.progress === 100 &&
        progress.step === "sensitivity"
      ) {
        setTimeout(() => {
          fetchVideos();
          setIsAnalyzing(false);
        }, 1000);
      }
    }
  }, [video, isAnalyzing, processingProgress, fetchVideos]);

  // Initialize HLS player
  useEffect(() => {
    if (!video || !videoRef.current || !video.masterPlaylistUrl) return;

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
      hls.loadSource(video.masterPlaylistUrl);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level) => `${level.height}p`);
        setAvailableQualities(levels);
      });
      //@ts-ignore
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        if (currentQuality === "auto") {
          setCurrentQuality(`${level.height}p (auto)`);
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = video.masterPlaylistUrl;
    }
  }, [video, currentQuality]);

  // Player controls handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handleQualityChange = (quality: string) => {
    if (!hlsRef.current) return;
    if (quality === "auto") {
      hlsRef.current.currentLevel = -1;
      setCurrentQuality("auto");
    } else {
      const levelIndex = hlsRef.current.levels.findIndex(
        (level) => `${level.height}p` === quality
      );
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex;
        setCurrentQuality(quality);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      await deleteVideo(video._id);
      navigate("/dashboard/explore");
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/videos/${
          video._id
        }/analyze-sensitivity`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Analysis failed");
      await fetchVideos();
    } catch (error) {
      console.error("[ERROR] Sensitivity analysis failed:", error);
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
        <button
          onClick={() => navigate("/dashboard/explore")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/explore")}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Pulse</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column - Video Player */}
          <div className="space-y-4">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden aspect-video relative group">
              <video
                ref={videoRef}
                className="w-full h-full"
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={handlePlayPause}
              />

              {!video.masterPlaylistUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white mx-auto mb-4" />
                    <p>Video is still processing...</p>
                  </div>
                </div>
              )}

              <VideoControls
                isPlaying={isPlaying}
                isMuted={isMuted}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                currentQuality={currentQuality}
                availableQualities={availableQualities}
                onPlayPause={handlePlayPause}
                onMuteToggle={handleMuteToggle}
                onVolumeChange={handleVolumeChange}
                onSeek={handleSeek}
                onFullscreen={handleFullscreen}
                onQualityChange={handleQualityChange}
              />
            </div>
          </div>

          {/* Right Column - Video Info */}
          <div className="space-y-4">
            {/* Video Title & Delete Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {new Date(video.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                title="Delete video"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <SensitivityAnalysisCard
              video={video}
              isAnalyzing={isAnalyzing}
              processingProgress={processingProgress}
              onAnalyze={handleAnalyze}
            />

            <VideoDetailsCard video={video} />
          </div>
        </div>
      </div>
    </div>
  );
}
