import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { deleteMedia } from "@/src/services/media";
import { mediaRepository } from "@/src/repositories/media";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/admin/media/:id
 * Get a single media record.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const record = await mediaRepository.findById(id);
    if (!record) {
      return NextResponse.json(
        { message: "Media not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
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

/**
 * DELETE /api/v1/admin/media/:id
 * Delete a media record and its S3 objects.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await deleteMedia(id);

    return NextResponse.json({ message: "Media deleted" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Media not found"
        ? 404
        : message === "Unauthorized"
          ? 401
          : message === "Forbidden"
            ? 403
            : 500;
    return NextResponse.json({ message }, { status });
  }
}
