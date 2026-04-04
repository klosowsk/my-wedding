import { NextRequest, NextResponse } from "next/server";
import { pageService } from "@/src/services/page";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = request.nextUrl;
    const locale = searchParams.get("locale") ?? "pt-BR";

    const page = await pageService.getBySlug(slug, locale);

    if (!page) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
