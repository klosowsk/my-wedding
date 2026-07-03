"use client";

import { useEffect, useState } from "react";
import GiftGrid from "./GiftGrid";
import PaymentModal from "./PaymentModal";
import PaymentResultModal, { type PaymentResult } from "./PaymentResultModal";

interface Gift {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  collectedCents: number;
  imageUrl?: string | null;
  status: "available" | "fully_funded" | "hidden";
  contributionMode: "open" | "fixed" | "quotes";
  fixedContributionOptions: number[];
  quoteUnitCents: number | null;
  showCollectedAmount: boolean;
  showGoalAmount: boolean;
  showFundedBadge: boolean;
}

interface GiftsWithPaymentProps {
  gifts: Gift[];
  contributeLabel: string;
  fundedLabel: string;
  progressLabel: string;
  collectedLabel: string;
  goalLabel: string;
  quoteUnitLabel: string;
  locale: string;
  currency: {
    code: string;
    locale: string;
  };
}

export default function GiftsWithPayment({
  gifts,
  contributeLabel,
  fundedLabel,
  progressLabel,
  collectedLabel,
  goalLabel,
  quoteUnitLabel,
  locale,
  currency,
}: GiftsWithPaymentProps) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [resultGiftId, setResultGiftId] = useState<string | null>(null);

  // After returning from Stripe Checkout the guest lands on
  // /gifts?payment=success|cancelled&gift=<id>. Read it once, then strip the
  // query so a refresh or back-navigation doesn't re-trigger the modal.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success" || payment === "cancelled" || payment === "error") {
      setPaymentResult(payment);
      setResultGiftId(params.get("gift"));

      params.delete("payment");
      params.delete("gift");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : "")
      );
    }
  }, []);

  const handleContribute = (giftId: string) => {
    const gift = gifts.find((g) => g.id === giftId);
    if (gift) {
      setSelectedGift(gift);
    }
  };

  const handleClose = () => {
    setSelectedGift(null);
  };

  const resultGift = resultGiftId
    ? gifts.find((g) => g.id === resultGiftId) ?? null
    : null;

  const handleResultClose = () => {
    setPaymentResult(null);
    setResultGiftId(null);
  };

  // Retry: close the result modal and reopen the payment modal for that gift.
  const handleRetry = resultGift
    ? () => {
        setPaymentResult(null);
        setResultGiftId(null);
        setSelectedGift(resultGift);
      }
    : undefined;

  return (
    <>
      <GiftGrid
        gifts={gifts}
        contributeLabel={contributeLabel}
        fundedLabel={fundedLabel}
        progressLabel={progressLabel}
        collectedLabel={collectedLabel}
        goalLabel={goalLabel}
        quoteUnitLabel={quoteUnitLabel}
        currency={currency}
        onContribute={handleContribute}
      />

      {selectedGift && (
        <PaymentModal
          gift={selectedGift}
          open={!!selectedGift}
          onClose={handleClose}
          locale={locale}
          currency={currency}
        />
      )}

      <PaymentResultModal
        result={paymentResult}
        giftName={resultGift?.name}
        onClose={handleResultClose}
        onRetry={handleRetry}
      />
    </>
  );
}
