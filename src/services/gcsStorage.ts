import { Storage } from "@google-cloud/storage";
import { config } from "../config.js";

const storage = new Storage({ projectId: config.googleCloudProject });
const bucket = storage.bucket(config.gcsBucketName);

export async function uploadImage(
  buf: Buffer,
  cardId: string,
): Promise<{ publicUrl: string; gcsPath: string }> {
  const gcsPath = `recipe-cards/${cardId}.jpg`;
  const file = bucket.file(gcsPath);

  await file.save(buf, {
    contentType: "image/jpeg",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  const publicUrl = `https://storage.googleapis.com/${config.gcsBucketName}/${gcsPath}`;
  return { publicUrl, gcsPath };
}

export async function deleteImage(gcsPath: string): Promise<void> {
  const file = bucket.file(gcsPath);
  await file.delete({ ignoreNotFound: true });
}
