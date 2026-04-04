import sharp from "sharp";
import { encode } from "blurhash";
import { randomUUID } from "crypto";
import { putObject, deleteObject } from "../lib/s3";
import { mediaRepository } from "../repositories/media";
import {
  IMAGE_VARIANTS,
  BLURHASH_COMPONENTS,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_SIZE,
} from "@marriage/shared";

export interface UploadResult {
  id: string;
  url: string;
  thumbUrl: string | null;
  width: number;
  height: number;
  blurhash: string | null;
  status: "ready" | "failed";
}

/**
 * Upload and process a single image.
 *
 * Flow:
 * 1. Validate MIME type and size
 * 2. Create media record (status: processing)
 * 3. Process with sharp: EXIF strip, auto-rotate, resize, WebP conversion
 * 4. Generate thumbnail
 * 5. Compute blurhash placeholder
 * 6. Upload full + thumb to S3
 * 7. Update media record with results
 *
 * HEIC/HEIF (iPhone): sharp handles conversion automatically via libheif.
 * All output is WebP for consistent, optimized delivery.
 */
export async function uploadImage(
  file: File,
  folder: string = "uploads"
): Promise<UploadResult> {
  // --- Validate ---
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    throw new Error(
      `Unsupported file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`
    );
  }

  const id = randomUUID();
  const key = `${folder}/${id}.webp`;
  const thumbKey = `${folder}/${id}.thumb.webp`;

  // --- Create DB record (processing) ---
  const record = await mediaRepository.create({
    id,
    key,
    url: "", // placeholder, updated after upload
    contentType: "image/webp",
    originalName: file.name,
    status: "processing",
  });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // --- Process full image ---
    // sharp auto-detects HEIC/HEIF/JPEG/PNG/WebP
    // .rotate() auto-rotates based on EXIF orientation, then strips EXIF
    const fullVariant = IMAGE_VARIANTS.FULL;
    const processed = await sharp(buffer)
      .rotate()
      .resize(fullVariant.width, fullVariant.height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: fullVariant.quality })
      .toBuffer({ resolveWithObject: true });

    // --- Generate thumbnail ---
    const thumbVariant = IMAGE_VARIANTS.THUMB;
    const thumb = await sharp(buffer)
      .rotate()
      .resize(thumbVariant.width, thumbVariant.height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: thumbVariant.quality })
      .toBuffer();

    // --- Generate blurhash ---
    let blurhash: string | null = null;
    try {
      const blurhashSize = 32;
      const { data: pixels, info } = await sharp(buffer)
        .rotate()
        .resize(blurhashSize, blurhashSize, { fit: "inside" })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      blurhash = encode(
        new Uint8ClampedArray(pixels),
        info.width,
        info.height,
        BLURHASH_COMPONENTS.x,
        BLURHASH_COMPONENTS.y
      );
    } catch (err) {
      console.error("[Media] Blurhash generation failed:", err);
    }

    // --- Upload to S3 ---
    const url = await putObject(key, processed.data, "image/webp");
    const thumbUrl = await putObject(thumbKey, thumb, "image/webp");

    // --- Update DB record ---
    const updated = await mediaRepository.updateProcessingResult(record.id, {
      url,
      thumbKey,
      thumbUrl,
      width: processed.info.width,
      height: processed.info.height,
      size: processed.data.length,
      blurhash,
      status: "ready",
    });

    return {
      id: record.id,
      url,
      thumbUrl,
      width: processed.info.width,
      height: processed.info.height,
      blurhash,
      status: "ready",
    };
  } catch (err) {
    // Mark as failed so it can be cleaned up
    await mediaRepository.updateStatus(record.id, "failed").catch(() => {});
    throw err;
  }
}

/**
 * Delete a media record and its S3 objects (full + thumb).
 */
export async function deleteMedia(id: string): Promise<void> {
  const record = await mediaRepository.findById(id);
  if (!record) throw new Error("Media not found");

  // Delete from S3 (ignore errors — objects may not exist)
  await deleteObject(record.key).catch(() => {});
  if (record.thumbKey) {
    await deleteObject(record.thumbKey).catch(() => {});
  }

  // Delete DB record
  await mediaRepository.remove(id);
}
