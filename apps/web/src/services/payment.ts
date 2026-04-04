import {
  giftRepository,
  giftContributionRepository,
} from "../repositories/gift";
import * as stripeLib from "../lib/stripe";
import { z } from "zod";

function toNullableUuid(value: string): string | null {
  return z.string().uuid().safeParse(value).success ? value : null;
}

function parseFixedContributionOptions(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 100);
  } catch {
    return [];
  }
}

function resolveContributionAmount(
  gift: Awaited<ReturnType<typeof giftRepository.findById>>,
  amountCents: number,
  quoteQuantity?: number
) {
  if (!gift) {
    throw new Error("Gift not found");
  }

  if (gift.contributionMode === "quotes") {
    const unit = gift.quoteUnitCents ?? 0;
    if (unit < 100) {
      throw new Error("Quote unit is not configured");
    }
    const quantity = Math.max(1, quoteQuantity ?? 1);
    return {
      amountCents: unit * quantity,
      quoteQuantity: quantity,
      quoteUnitCents: unit,
    };
  }

  if (gift.contributionMode === "fixed") {
    const options = parseFixedContributionOptions(gift.fixedContributionOptions);
    if (options.length > 0 && !options.includes(amountCents)) {
      throw new Error("Invalid fixed contribution amount");
    }
  }

  return {
    amountCents,
    quoteQuantity: null,
    quoteUnitCents: null,
  };
}

export const paymentService = {
  /**
   * Create a PIX contribution with status 'pending'.
   * Admin must later confirm after verifying bank statement.
   */
  async createPixContribution(
    giftId: string,
    amountCents: number,
    contributorName?: string,
    guestId?: string,
    quoteQuantity?: number
  ) {
    const gift = await giftRepository.findById(giftId);
    if (!gift) {
      throw new Error("Gift not found");
    }
    const resolved = resolveContributionAmount(gift, amountCents, quoteQuantity);

    const contribution = await giftContributionRepository.create({
      giftId,
      amountCents: resolved.amountCents,
      quoteQuantity: resolved.quoteQuantity,
      quoteUnitCents: resolved.quoteUnitCents,
      contributorName: contributorName || null,
      guestId: guestId || null,
      paymentMethod: "pix",
      paymentStatus: "pending",
    });

    return contribution;
  },

  /**
   * Admin confirms a PIX contribution after checking the bank statement.
   * Recalculates the gift's collected total and updates status if fully funded.
   */
  async confirmPix(contributionId: string, adminUserId: string) {
    const contribution =
      await giftContributionRepository.findById(contributionId);
    if (!contribution) {
      throw new Error("Contribution not found");
    }

    if (contribution.paymentStatus === "confirmed") {
      throw new Error("Contribution is already confirmed");
    }

    await giftContributionRepository.update(contributionId, {
      paymentStatus: "confirmed",
      confirmedBy: toNullableUuid(adminUserId),
      confirmedAt: new Date(),
    });

    await recalculateGiftCollected(contribution.giftId);
  },

  /**
   * Admin rejects a PIX contribution (e.g. payment not found in bank statement).
   */
  async rejectPix(contributionId: string) {
    const contribution =
      await giftContributionRepository.findById(contributionId);
    if (!contribution) {
      throw new Error("Contribution not found");
    }

    await giftContributionRepository.update(contributionId, {
      paymentStatus: "failed",
    });
  },

  /**
   * Create a Stripe Checkout session and store the session ID in the contribution.
   * Returns the session URL for client-side redirect.
   */
  async createStripeSession(
    giftId: string,
    amountCents: number,
    contributorName: string,
    successUrl: string,
    cancelUrl: string,
    quoteQuantity?: number
  ): Promise<{ sessionId: string; url: string }> {
    const gift = await giftRepository.findById(giftId);
    if (!gift) {
      throw new Error("Gift not found");
    }
    const resolved = resolveContributionAmount(gift, amountCents, quoteQuantity);

    if (!stripeLib.isConfigured()) {
      throw new Error("Stripe is not configured");
    }

    const session = await stripeLib.createCheckoutSession({
      amountCents: resolved.amountCents,
      description: gift.namePt,
      successUrl,
      cancelUrl,
      metadata: {
        giftId,
        contributorName,
      },
    });

    if (!session || !session.url) {
      throw new Error("Failed to create Stripe session");
    }

    // Create a contribution record linked to the Stripe session
    await giftContributionRepository.create({
      giftId,
      amountCents: resolved.amountCents,
      quoteQuantity: resolved.quoteQuantity,
      quoteUnitCents: resolved.quoteUnitCents,
      contributorName: contributorName || null,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      stripeSessionId: session.id,
    });

    return { sessionId: session.id, url: session.url };
  },

  /**
   * Handle Stripe webhook events.
   * On checkout.session.completed: confirm the contribution and recalculate gift total.
   */
  async handleStripeWebhook(payload: string, signature: string) {
    const event = stripeLib.constructWebhookEvent(payload, signature);
    if (!event) {
      throw new Error("Invalid webhook event");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const stripeSessionId = session.id;

      const contribution =
        await giftContributionRepository.findByStripeSessionId(
          stripeSessionId
        );
      if (!contribution) {
        // Session not found — may not be from our app, skip silently
        return;
      }

      if (contribution.paymentStatus === "confirmed") {
        // Already confirmed — idempotent, skip
        return;
      }

      await giftContributionRepository.update(contribution.id, {
        paymentStatus: "confirmed",
        confirmedAt: new Date(),
      });

      await recalculateGiftCollected(contribution.giftId);
    }
  },
};

/**
 * Recalculate a gift's collected cents from all confirmed contributions.
 * Updates gift status to 'fully_funded' if threshold reached.
 */
async function recalculateGiftCollected(giftId: string) {
  const allContributions =
    await giftContributionRepository.findByGiftId(giftId);

  const totalCollected = allContributions
    .filter((c) => c.paymentStatus === "confirmed")
    .reduce((sum, c) => sum + c.amountCents, 0);

  await giftRepository.updateCollected(giftId, totalCollected);
}
