import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { galleryRepository } from "@/src/repositories/gallery";
import { updateGallerySchema } from "@marriage/shared/validators";
import { z } from "zod";

export async function GET() {
  try {
    await requireAdmin();

    const photos = await galleryRepository.findAllWithMedia();

    return NextResponse.json(photos);
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

const createPhotoSchema = z.object({
  mediaId: z.string().uuid(),
  filename: z.string().min(1),
  captionPt: z.string().max(500).optional().nullable(),
  captionEn: z.string().max(500).optional().nullable(),
  captionEs: z.string().max(500).optional().nullable(),
  section: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createPhotoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const photo = await galleryRepository.create(parsed.data);

    return NextResponse.json(photo, { status: 201 });
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

const updateGalleryBatchSchema = z.array(updateGallerySchema);

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const parsed = updateGalleryBatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await Promise.all(
      parsed.data.map(({ id, ...data }) => galleryRepository.update(id, data))
    );

    return NextResponse.json(updated);
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
