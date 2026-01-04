import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
  type DeleteObjectsCommandInput,
} from "@aws-sdk/client-s3";
import { s3Client } from "./s3Creds.js";

/**
 * Deletes all objects in a video folder from S3
 * This includes the original file and all ABR variants (240p, 720p, master.m3u8, etc.)
 */
export const deleteVideoFolder = async (videoId: string): Promise<void> => {
  try {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new Error("AWS_S3_BUCKET environment variable is not set");
    }

    const prefix = `videos/${videoId}/`;

    // Step 1: List all objects with the videoId prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log(`No objects found for video ${videoId}`);
      return;
    }

    // Step 2: Delete all objects
    const objectsToDelete = listedObjects.Contents.map((obj) => ({
      Key: obj.Key!,
    }));

    const deleteCommand: DeleteObjectsCommandInput = {
      Bucket: bucket,
      Delete: {
        Objects: objectsToDelete,
        Quiet: true,
      },
    };

    const deleteResult = await s3Client.send(
      new DeleteObjectsCommand(deleteCommand)
    );

    console.log(
      `Deleted ${objectsToDelete.length} objects for video ${videoId}`
    );

    if (deleteResult.Errors && deleteResult.Errors.length > 0) {
      console.error("Some objects failed to delete:", deleteResult.Errors);
      throw new Error("Failed to delete some S3 objects");
    }
  } catch (error) {
    console.error("Error deleting video folder from S3:", error);
    throw new Error("Failed to delete video from S3");
  }
};
