import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * S3 configuration — works with:
 * - MinIO (local dev): S3_ENDPOINT=http://localhost:9010, S3_FORCE_PATH_STYLE=true
 * - Cloudflare R2 (prod): S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com, S3_FORCE_PATH_STYLE=false
 * - AWS S3: just set region + credentials, no endpoint override needed
 */

const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "http://localhost:9010";
const S3_BUCKET = process.env.S3_BUCKET ?? "marriage-uploads";
const S3_REGION = process.env.S3_REGION ?? "us-east-1";
const S3_FORCE_PATH_STYLE = process.env.S3_FORCE_PATH_STYLE !== "false"; // true for MinIO, false for R2

/**
 * Public base URL for client-accessible object URLs.
 *
 * Local dev (MinIO): http://localhost:9010/marriage-uploads
 *   → MinIO serves files at endpoint/bucket/key with anonymous download
 *
 * Production (R2): https://media.wedding.yourdomain.com
 *   → Cloudflare R2 custom domain (or R2.dev public URL)
 *
 * This is what gets stored in the DB `url` column and served to browsers.
 */
const S3_PUBLIC_URL =
  process.env.S3_PUBLIC_URL ?? `${S3_ENDPOINT}/${S3_BUCKET}`;

const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "marriage",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "marriage_dev_secret",
  },
});

/**
 * Upload a buffer to S3.
 * Returns the public URL for the object.
 */
export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${S3_PUBLIC_URL}/${key}`;
}

/**
 * Delete an object from S3.
 */
export async function deleteObject(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
}

export { S3_PUBLIC_URL, S3_BUCKET, s3Client };
