import { NextRequest, NextResponse } from "next/server";
import { galleryService } from "@/src/services/gallery";

export async function GET(_request: NextRequest) {
  try {
    const photos = await galleryService.listVisible();

    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
