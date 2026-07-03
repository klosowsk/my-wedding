import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function isConfigured(): boolean {
  return stripe !== null;
}

export async function createCheckoutSession(params: {
  amountCents: number;
  currency?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;

  return stripe.checkout.sessions.create({
    mode: "payment",
    // Brazilian card installments (parcelamento). The API only toggles it on;
    // the plans offered (e.g. cap at 10x) and per-plan minimums are configured
    // in the Stripe Dashboard → Payment methods → Card → Installments.
    payment_method_options: {
      card: { installments: { enabled: true } },
    },
    line_items: [
      {
        price_data: {
          currency: params.currency ?? "brl",
          product_data: { name: params.description },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });
}

export function constructWebhookEvent(
  payload: string,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null;

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
