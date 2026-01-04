import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, Video, X, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputWithError from "@/components/ui/InputWithError";
import { useVideo } from "@/contexts/VideoContext";
import { useSocket } from "@/contexts/SocketContext";
import type { VideoUploadData } from "@/types/video";
import { formatFileSize } from "@/utils/videoUtils";

export default function UploadContent() {
  const { uploadVideo, uploadProgress } = useVideo();
  const { processingProgress, setOnVideoComplete } = useSocket();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedVideoData, setUploadedVideoData] = useState<{
    _id: string;
    videoId: string;
  } | null>(null);

  const [formData, setFormData] = useState<VideoUploadData>({
    title: "",
    file: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof VideoUploadData, string>>
  >({});

  const handleInputChange = (field: keyof VideoUploadData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setFormData((prev) => ({ ...prev, file }));

        // Auto-fill title from filename if empty
        if (!formData.title) {
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          setFormData((prev) => ({ ...prev, title: fileName }));
        }

        // Clear file error
        if (errors.file) {
          setErrors((prev) => ({ ...prev, file: undefined }));
        }
      }
    },
  });

  const removeFile = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, file: null }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof VideoUploadData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Video title is required";
      toast.error("Please enter a video title");
    }

    if (!formData.file) {
      newErrors.file = "Please select a video file";
      toast.error("Please select a video file to upload");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Set up callback for when video processing completes
    setOnVideoComplete((videoId: string) => {
      if (uploadedVideoData && videoId === uploadedVideoData.videoId) {
        toast.success("Video processing complete!");
        // Navigate to the video player page using MongoDB _id
        navigate(`/player/${uploadedVideoData._id}`);
      }
    });
  }, [uploadedVideoData, setOnVideoComplete, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const uploadedVideo = await uploadVideo(formData.file!, formData.title);

      // Upload complete, now show processing
      setUploadComplete(true);
      setUploadedVideoData({
        _id: uploadedVideo._id,
        videoId: uploadedVideo.videoId,
      });
    } catch (error) {
      // Error handling is done in context
      console.error("Upload failed:", error);
    }
  };

  // Get current processing progress
  const currentProgress = uploadedVideoData
    ? processingProgress.get(uploadedVideoData.videoId)
    : null;

  // Show combined upload + processing view when uploading or processing
  const showProgressView = uploadProgress.isUploading || uploadComplete;

  if (showProgressView && selectedFile) {
    const isUploading = uploadProgress.isUploading;
    const isProcessing = uploadComplete && !isUploading;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isUploading ? "Uploading Video" : "Processing Video"}
          </CardTitle>
          <CardDescription>
            {isUploading
              ? "Uploading to S3 storage..."
              : "Transcoding for streaming playback"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Info */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary/10 rounded-full">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              {isUploading
                ? "Uploading to S3..."
                : currentProgress
                ? currentProgress.message
                : "Waiting for processing to start..."}
            </h3>

            <p className="text-sm text-muted-foreground mb-6">
              {isUploading
                ? "Please wait while your video is uploaded"
                : "This may take a few minutes depending on video length"}
            </p>

            {/* Progress Bar - Upload Phase */}
            {isUploading && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Upload Progress</span>
                  <span className="font-medium">
                    {uploadProgress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Progress Bar - Processing Phase */}
            {isProcessing && currentProgress && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {currentProgress.step === "hls"
                      ? "HLS Transcoding"
                      : currentProgress.step.charAt(0).toUpperCase() +
                        currentProgress.step.slice(1)}
                  </span>
                  <span className="font-medium">
                    {currentProgress.progress}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500 ease-out"
                    style={{ width: `${currentProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info message */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-center">
            <p className="text-muted-foreground">
              {isUploading
                ? "Step 1/2: Uploading video to cloud storage"
                : "Step 2/2: Processing video for streaming playback"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show upload form
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Video</CardTitle>
        <CardDescription>
          Upload your video for content sensitivity analysis and streaming
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Title Input */}
          <div className="space-y-2">
            <InputWithError
              title="Video Title *"
              labelType="uppercase"
              inputType="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter video title..."
              errorMessage={errors.title}
              disabled={uploadProgress.isUploading}
            />
          </div>

          {/* Drag and Drop Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Video File *
            </label>
            <div>
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors duration-200
                    ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }
                    ${errors.file ? "border-red-500" : ""}
                  `}
                >
                  <input
                    {...getInputProps()}
                    disabled={uploadProgress.isUploading}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {isDragActive
                          ? "Drop your video here"
                          : "Drag & drop your video here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse files
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: MP4, MOV, AVI, MKV, WebM
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    {!uploadProgress.isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {uploadProgress.percentage === 100 &&
                      !uploadProgress.isUploading && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                  </div>

                  {/* Upload Progress Bar */}
                  {uploadProgress.isUploading &&
                    uploadProgress.percentage > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Uploading...
                          </span>
                          <span className="font-medium">
                            {uploadProgress.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
            {errors.file && (
              <p className="text-xs text-red-600 font-medium">{errors.file}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({ title: "", file: null });
                setSelectedFile(null);
                setErrors({});
              }}
              disabled={uploadProgress.isUploading}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploadProgress.isUploading}
              className="min-w-32"
            >
              {uploadProgress.isUploading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
