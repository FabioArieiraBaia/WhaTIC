import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export const uploadToGCS = async (file: Express.Multer.File, folder: string = "public"): Promise<string> => {
  const storageType = process.env.STORAGE_TYPE || "local";
  const bucketName = process.env.GCS_BUCKET;

  if (storageType !== "gcs" || !bucketName) {
    return file.filename;
  }

  try {
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const destination = `${folder}/${file.filename}`;

    await bucket.upload(file.path, {
      destination,
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Remove local file after upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return destination;
  } catch (err) {
    logger.error(`Error uploading file to GCS: ${err.message}`);
    return file.filename;
  }
};
