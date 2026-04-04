import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/src/services/payment";

/**
 * Stripe webhook handler.
 * IMPORTANT: Do NOT parse body as JSON — Stripe signature verification
 * requires the raw request body text.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    await paymentService.handleStripeWebhook(payload, signature);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";

    // Return 400 for signature verification failures so Stripe retries
    return NextResponse.json({ message }, { status: 400 });
  }
}
