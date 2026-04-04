import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { pageRepository } from "@/src/repositories/page";
import { updatePageSchema } from "@marriage/shared/validators";
import { db, pages } from "@marriage/db";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

async function findPageById(id: string) {
  return db.query.pages.findFirst({
    where: eq(pages.id, id),
  });
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const page = await findPageById(id);

    if (!page) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
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

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await findPageById(id);
    if (!existing) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    const updated = await pageRepository.update(id, parsed.data);

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

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await findPageById(id);
    if (!existing) {
      return NextResponse.json(
        { message: "Page not found" },
        { status: 404 }
      );
    }

    await pageRepository.remove(id);

    return NextResponse.json({ message: "Page deleted" });
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
