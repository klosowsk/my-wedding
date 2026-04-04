import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import {
  giftRepository,
  giftContributionRepository,
} from "@/src/repositories/gift";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const confirmContributionSchema = z.object({
  contributionId: z.string().uuid(),
  action: z.enum(["confirm", "reject"]),
});

function toNullableUuid(value: string): string | null {
  return z.string().uuid().safeParse(value).success ? value : null;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const gift = await giftRepository.findById(id);
    if (!gift) {
      return NextResponse.json(
        { message: "Gift not found" },
        { status: 404 }
      );
    }

    const contributions = await giftContributionRepository.findByGiftId(id);

    return NextResponse.json(contributions);
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
    const session = await requireAdmin();

    const { id: giftId } = await params;
    const body = await request.json();

    const parsed = confirmContributionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { contributionId, action } = parsed.data;

    const gift = await giftRepository.findById(giftId);
    if (!gift) {
      return NextResponse.json(
        { message: "Gift not found" },
        { status: 404 }
      );
    }

    const paymentStatus = action === "confirm" ? "confirmed" : "failed";

    const contribution = await giftContributionRepository.update(
      contributionId,
      {
        paymentStatus,
        confirmedBy: toNullableUuid(session.user.id),
        confirmedAt: action === "confirm" ? new Date() : null,
      }
    );

    if (!contribution) {
      return NextResponse.json(
        { message: "Contribution not found" },
        { status: 404 }
      );
    }

    // Recalculate collected amount for the gift
    if (action === "confirm") {
      const allContributions =
        await giftContributionRepository.findByGiftId(giftId);
      const totalCollected = allContributions
        .filter((c) => c.paymentStatus === "confirmed")
        .reduce((sum, c) => sum + c.amountCents, 0);

      await giftRepository.updateCollected(giftId, totalCollected);
    }

    return NextResponse.json(contribution);
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
