import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { uploadImage } from "@/src/services/media";

/**
 * POST /api/v1/admin/upload
 *
 * Multipart form upload. Accepts a single image file.
 * Processes synchronously: EXIF strip, resize, WebP, thumbnail, blurhash.
 * Uploads to S3/MinIO/R2.
 *
 * Body: FormData with field "file" (image) and optional "folder" (string).
 * Returns: { id, url, thumbUrl, width, height, blurhash, status }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No file provided. Send a file in the 'file' field." },
        { status: 400 }
      );
    }

    const result = await uploadImage(file, folder);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    // Map known errors to status codes
    const status = message.includes("Unsupported file type")
      ? 415
      : message.includes("File too large")
        ? 413
        : message === "Unauthorized"
          ? 401
          : message === "Forbidden"
            ? 403
            : 500;

    return NextResponse.json({ message }, { status });
  }
}
