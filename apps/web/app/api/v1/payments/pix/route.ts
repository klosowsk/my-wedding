import { NextRequest, NextResponse } from "next/server";
import { createContributionSchema } from "@marriage/shared/validators";
import { paymentService } from "@/src/services/payment";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = createContributionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { giftId, amountCents, quoteQuantity, contributorName } = parsed.data;

    const contribution = await paymentService.createPixContribution(
      giftId,
      amountCents,
      contributorName ?? undefined,
      undefined,
      quoteQuantity
    );

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Gift not found"
        ? 404
        : message === "Invalid fixed contribution amount" ||
            message === "Quote unit is not configured"
          ? 400
          : 500;
    return NextResponse.json({ message }, { status });
  }
}
