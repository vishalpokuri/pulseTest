import { Bucket$, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3Creds.js";
export const putObject = async (
  file: Buffer | Uint8Array | Blob | string,
  fileName: string
): Promise<{ url: string; key: string }> => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${fileName}`,
      Body: file,
      ContentType: "video/mkv,mp4,mp3",
    };
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    if (data.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Failed to upload file: ${data.$metadata.httpStatusCode}`
      );
    }

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log(url);
    return { url, key: params.Key };
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
};
