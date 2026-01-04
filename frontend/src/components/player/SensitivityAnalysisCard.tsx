import { Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSensitivityColor } from "@/utils/videoUtils";

interface SensitivityAnalysisCardProps {
  video: any;
  isAnalyzing: boolean;
  processingProgress: any;
  onAnalyze: () => void;
}

export default function SensitivityAnalysisCard({
  video,
  isAnalyzing,
  processingProgress,
  onAnalyze,
}: SensitivityAnalysisCardProps) {
  const progress = processingProgress?.get(video.videoId);

  return (
    <div className="bg-muted rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Sensitivity Analysis</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sensitivity Score</span>
          <div className="flex items-center gap-2">
            {video.sensitivityStatus === "completed" ? (
              <span
                className={`text-sm font-semibold ${getSensitivityColor(
                  video.sensitivity
                )}`}
              >
                {video.sensitivity}%
              </span>
            ) : video.sensitivityStatus === "analyzing" ? (
              <span className="text-sm text-blue-500 font-medium">
                Analyzing...
              </span>
            ) : video.sensitivityStatus === "failed" ? (
              <span className="text-sm text-red-500 font-medium">
                Analysis Failed
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Not analyzed
              </span>
            )}
          </div>
        </div>

        {/* Classification Badge */}
        {video.sensitivityStatus === "completed" && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Classification</span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                video.sensitivity <= 20
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : video.sensitivity <= 40
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {video.sensitivity <= 20
                ? "SAFE"
                : video.sensitivity <= 40
                ? "REVIEW"
                : "FLAGGED"}
            </span>
          </div>
        )}

        {/* Analyze Button */}
        {(video.sensitivityStatus === "pending" ||
          video.sensitivityStatus === "failed") && (
          <div className="pt-2">
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              <Scan className="h-4 w-4 mr-2" />
              {isAnalyzing
                ? "Analyzing..."
                : video.sensitivityStatus === "failed"
                ? "Retry Analysis"
                : "Analyze Sensitivity"}
            </Button>
          </div>
        )}

        {/* Progress Bar */}
        {(video.sensitivityStatus === "analyzing" || isAnalyzing) &&
          progress && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{progress.message || "Processing..."}</span>
                <span>{progress.progress || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress || 0}%` }}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
