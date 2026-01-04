import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3Client.js";
import fs from "fs";
import { Readable } from "stream";

const BUCKET = process.env.AWS_S3_BUCKET!;

/**
 * Download a file from S3 to local filesystem
 */
export async function downloadFromS3(
  s3Key: string,
  localPath: string
): Promise<void> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("Empty response from S3");
    }

    const writeStream = fs.createWriteStream(localPath);
    const readStream = response.Body as Readable;

    await new Promise<void>((resolve, reject) => {
      readStream.pipe(writeStream);
      readStream.on("error", reject);
      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    });

    console.log(`[SUCCESS] Downloaded: ${s3Key} → ${localPath}`);
  } catch (error) {
    console.error(`[ERROR] Failed to download ${s3Key}:`, error);
    throw error;
  }
}

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  localPath: string,
  s3Key: string,
  contentType?: string
): Promise<string> {
  try {
    const fileStream = fs.createReadStream(localPath);
    const fileStats = fs.statSync(localPath);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType,
      ContentLength: fileStats.size,
    });

    await s3Client.send(command);

    const s3Url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    console.log(`[SUCCESS] Uploaded: ${localPath} → ${s3Key}`);

    return s3Url;
  } catch (error) {
    console.error(`[ERROR] Failed to upload ${localPath}:`, error);
    throw error;
  }
}
