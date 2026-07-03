import { NextRequest, NextResponse } from "next/server";
import { createContributionSchema } from "@marriage/shared/validators";
import { paymentService } from "@/src/services/payment";
import { locales, routing } from "@/lib/i18n/routing";

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

    // Build return URLs from the canonical public URL, not the request host.
    // Behind a proxy/tunnel (prod: Cloudflare -> julianaerodrigo.com) or when
    // hit via localhost, request.nextUrl.origin is the wrong host for the guest.
    const origin = (
      process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
    ).replace(/\/$/, "");
    // Locale comes from the client (schema ignores it); validate against the
    // allowlist so the guest returns to their own localized gifts page.
    const rawLocale = typeof body?.locale === "string" ? body.locale : "";
    const locale = (locales as readonly string[]).includes(rawLocale)
      ? rawLocale
      : routing.defaultLocale;
    const successUrl = `${origin}/${locale}/gifts?payment=success&gift=${giftId}`;
    const cancelUrl = `${origin}/${locale}/gifts?payment=cancelled&gift=${giftId}`;

    const result = await paymentService.createStripeSession(
      giftId,
      amountCents,
      contributorName ?? "Anonymous",
      successUrl,
      cancelUrl,
      quoteQuantity
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Gift not found"
        ? 404
        : message === "Stripe is not configured"
          ? 503
          : message === "Invalid fixed contribution amount" ||
              message === "Quote unit is not configured"
            ? 400
            : 500;
    return NextResponse.json({ message }, { status });
  }
}
