import fs from "fs";
import path from "path";

const TEMP_DIR = process.env.TEMP_DIR || "./temp";

/**
 * Ensure temp directory exists
 */
export async function ensureTempDir(): Promise<void> {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(`[SUCCESS] Created temp directory: ${TEMP_DIR}`);
  }
}

/**
 * Create a unique directory for a video processing job
 */
export function createJobDir(videoId: string): string {
  const jobDir = path.join(TEMP_DIR, videoId);
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }
  return jobDir;
}

/**
 * Clean up job directory after processing
 */
export function cleanupJobDir(videoId: string): void {
  const jobDir = path.join(TEMP_DIR, videoId);
  if (fs.existsSync(jobDir)) {
    fs.rmSync(jobDir, { recursive: true, force: true });
    console.log(`[INFO] Cleaned up: ${jobDir}`);
  }
}

/**
 * Get file paths for processing
 */
export function getJobPaths(videoId: string, originalFileName: string) {
  const jobDir = createJobDir(videoId);
  const ext = path.extname(originalFileName);
  const baseName = path.basename(originalFileName, ext);

  return {
    jobDir,
    inputVideo: path.join(jobDir, `original${ext}`),
    thumbnail: path.join(jobDir, "thumbnail.jpg"),
    outputDir: path.join(jobDir, "output"),
  };
}
