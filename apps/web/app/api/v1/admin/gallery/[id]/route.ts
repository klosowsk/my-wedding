import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { galleryRepository } from "@/src/repositories/gallery";
import { deleteMedia } from "@/src/services/media";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * DELETE /api/v1/admin/gallery/:id
 * Deletes a photo record and its associated media (S3 objects + DB).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const photo = await galleryRepository.findById(id);
    if (!photo) {
      return NextResponse.json(
        { message: "Photo not found" },
        { status: 404 }
      );
    }

    // Delete associated media from S3 + DB if it exists
    if (photo.mediaId) {
      await deleteMedia(photo.mediaId).catch((err) => {
        console.error("[Gallery] Failed to delete media:", err);
      });
    }

    // Delete the photo record
    await galleryRepository.remove(id);

    return NextResponse.json({ message: "Photo deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json({ message }, { status });
  }
}
