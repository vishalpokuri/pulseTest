/**
 * Generate a thumbnail image from a video file
 * @param videoFile - The video file to extract thumbnail from
 * @param seekTime - Time in seconds to capture the frame (default: 1)
 * @returns Blob of the thumbnail image
 */
export const generateThumbnail = (
  videoFile: File,
  seekTime: number = 1
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.addEventListener("loadedmetadata", () => {
      // Seek to the desired time
      video.currentTime = Math.min(seekTime, video.duration);
    });

    video.addEventListener("seeked", () => {
      try {
        // Set canvas dimensions (max width 640px, maintain aspect ratio)
        const maxWidth = 640;
        const scale = Math.min(maxWidth / video.videoWidth, 1);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create thumbnail blob"));
            }
            // Cleanup
            URL.revokeObjectURL(video.src);
          },
          "image/jpeg",
          0.85
        );
      } catch (error) {
        reject(error);
        URL.revokeObjectURL(video.src);
      }
    });

    video.addEventListener("error", (e) => {
      reject(new Error(`Failed to load video: ${e}`));
      URL.revokeObjectURL(video.src);
    });

    video.src = URL.createObjectURL(videoFile);
  });
};
