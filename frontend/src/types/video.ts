export interface Video {
  _id: string;
  videoId: string; // Unique ID for organizing ABR content
  title: string;
  s3Key: string; // Path to original file
  s3Url: string;
  thumbnailUrl?: string; // URL to thumbnail image
  masterPlaylistUrl?: string; // URL to master.m3u8 for ABR streaming
  status: "uploading" | "processing" | "completed" | "failed";
  sensitivity: number;
  sensitivityStatus: "pending" | "analyzing" | "completed" | "failed";
  fileSize: number;
  duration: number;
  resolutions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  percentage: number;
  isUploading: boolean;
  currentFile: string | null;
}

export interface VideoUploadData {
  title: string;
  file: File | null;
}
