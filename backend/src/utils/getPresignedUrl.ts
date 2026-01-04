import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3Creds.js";
import { randomBytes } from "crypto";

interface PresignedUrlOptions {
  fileName: string;
  contentType: string;
  userId?: string;
  expiresIn?: number; // in seconds, default 15 minutes
}

interface PresignedUrlResult {
  presignedUrl: string;
  key: string;
  videoId: string;
  expiresIn: number;
}

/**
 * Generates a unique video ID for organizing ABR content
 * Format: {timestamp}-{randomHex}
 */
const generateVideoId = (): string => {
  const timestamp = Date.now();
  const randomHex = randomBytes(8).toString("hex");
  return `${timestamp}-${randomHex}`;
};

export const getPresignedUploadUrl = async ({
  fileName,
  contentType,
  expiresIn = 900, // 15 minutes default
}: PresignedUrlOptions): Promise<PresignedUrlResult> => {
  try {
    // Generate unique video ID for ABR folder structure
    const videoId = generateVideoId();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Store original file in /original subfolder
    // ABR versions will be created in /240p, /360p, /720p, etc.
    // Structure: videos/{videoId}/original/{fileName}
    //           videos/{videoId}/240p/segment0.ts
    //           videos/{videoId}/master.m3u8
    const key = `videos/${videoId}/original/${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return {
      presignedUrl,
      key,
      videoId,
      expiresIn,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
};
