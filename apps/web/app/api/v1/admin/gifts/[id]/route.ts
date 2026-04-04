import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { giftRepository } from "@/src/repositories/gift";
import { updateGiftSchema } from "@marriage/shared/validators";
import { db, gifts } from "@marriage/db";
import { eq } from "drizzle-orm";

function normalizeGiftPayload(input: {
  fixedContributionOptions?: number[] | null;
  [key: string]: unknown;
}) {
  const payload = { ...input } as Record<string, unknown>;

  if ("fixedContributionOptions" in payload) {
    const raw = payload.fixedContributionOptions;
    payload.fixedContributionOptions =
      Array.isArray(raw) && raw.length > 0 ? JSON.stringify(raw) : null;
  }

  return payload;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const gift = await db.query.gifts.findFirst({
      where: eq(gifts.id, id),
      with: { contributions: true, media: true },
    });

    if (!gift) {
      return NextResponse.json(
        { message: "Gift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gift);
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

    const parsed = updateGiftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await giftRepository.findById(id);
    if (!existing) {
      return NextResponse.json(
        { message: "Gift not found" },
        { status: 404 }
      );
    }

    const updated = await giftRepository.update(
      id,
      normalizeGiftPayload(parsed.data) as Parameters<typeof giftRepository.update>[1]
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

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await giftRepository.findById(id);
    if (!existing) {
      return NextResponse.json(
        { message: "Gift not found" },
        { status: 404 }
      );
    }

    await giftRepository.remove(id);

    return NextResponse.json({ message: "Gift deleted" });
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
