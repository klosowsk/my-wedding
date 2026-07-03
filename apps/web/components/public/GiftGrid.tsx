"use client";

import GiftCard from "./GiftCard";

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

interface GiftGridProps {
  gifts: Gift[];
  currency?: {
    code: string;
    locale: string;
  };
  onContribute?: (giftId: string) => void;
  className?: string;
}

export default function GiftGrid({
  gifts,
  currency,
  onContribute,
  className = "",
}: GiftGridProps) {
  if (gifts.length === 0) {
    return null;
  }

  return (
    <div
      className={[
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          currency={currency}
          onContribute={onContribute}
        />
      ))}
    </div>
  );
}
