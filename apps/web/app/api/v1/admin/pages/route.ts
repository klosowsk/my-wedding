import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { pageRepository } from "@/src/repositories/page";
import { createPageSchema } from "@marriage/shared/validators";

export async function GET() {
  try {
    await requireAdmin();

    const pages = await pageRepository.findAll();

    return NextResponse.json(pages);
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

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await pageRepository.findBySlug(parsed.data.slug);
    if (existing) {
      return NextResponse.json(
        { message: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    const page = await pageRepository.create(parsed.data);

    return NextResponse.json(page, { status: 201 });
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
