"use client";

import { useState } from "react";
import GiftGrid from "./GiftGrid";
import PaymentModal from "./PaymentModal";

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

  const handleContribute = (giftId: string) => {
    const gift = gifts.find((g) => g.id === giftId);
    if (gift) {
      setSelectedGift(gift);
    }
  };

  const handleClose = () => {
    setSelectedGift(null);
  };

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
    </>
  );
}
