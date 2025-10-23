// FILE: src/server/lib/storage.ts
// Minimal S3/MinIO wrapper with signed PUT/GET for media externalization.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const s3 = new S3Client({
  region: env.S3_REGION || "auto",
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export async function getSignedPutUrl(key: string, contentType?: string) {
  const cmd = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
  return url;
}

export function objectUri(key: string) {
  // return https style by default for client consumption
  const endpoint = (env.S3_ENDPOINT || "").replace(/^https?:\/\//, "");
  return `https://${env.S3_BUCKET}.${endpoint}/${key}`;
}
