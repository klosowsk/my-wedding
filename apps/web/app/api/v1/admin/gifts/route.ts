import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { giftRepository } from "@/src/repositories/gift";
import { createGiftSchema } from "@marriage/shared/validators";
import { db, gifts } from "@marriage/db";
import { asc } from "drizzle-orm";

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

export async function GET() {
  try {
    await requireAdmin();

    const allGifts = await db.query.gifts.findMany({
      with: { contributions: true, media: true },
      orderBy: [asc(gifts.sortOrder)],
    });

    const result = allGifts.map((gift) => ({
      ...gift,
      contributionCount: gift.contributions.length,
    }));

    return NextResponse.json(result);
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
    const parsed = createGiftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const gift = await giftRepository.create(
      normalizeGiftPayload(parsed.data) as Parameters<typeof giftRepository.create>[0]
    );

    return NextResponse.json(gift, { status: 201 });
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
