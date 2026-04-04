"use client";

import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@marriage/shared";

function metricLabel(template: string, fallback: string): string {
  const clean = template
    .replace("{amount}", "")
    .replace(/[:：]/g, "")
    .trim();
  return clean || fallback;
}

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

interface GiftCardProps {
  gift: Gift;
  contributeLabel: string;
  fundedLabel: string;
  progressLabel: string;
  collectedLabel: string;
  goalLabel: string;
  quoteUnitLabel: string;
  currency?: {
    code: string;
    locale: string;
  };
  onContribute?: (giftId: string) => void;
  className?: string;
}

export default function GiftCard({
  gift,
  contributeLabel,
  fundedLabel,
  progressLabel,
  collectedLabel,
  goalLabel,
  quoteUnitLabel,
  currency,
  onContribute,
  className = "",
}: GiftCardProps) {
  const percent = Math.min(
    Math.round((gift.collectedCents / gift.priceCents) * 100),
    100
  );
  const isFullyFunded = gift.status === "fully_funded" || percent >= 100;
  const showProgress = gift.showCollectedAmount && gift.showGoalAmount;
  const showFundedBadge = isFullyFunded && gift.showFundedBadge;
  const isQuotesMode = gift.contributionMode === "quotes" && !!gift.quoteUnitCents;
  const collectedTitle = metricLabel(collectedLabel, "Collected");
  const goalTitle = metricLabel(goalLabel, "Goal");

  return (
    <div
      className={[
        "bg-warm-white border border-secondary rounded-xl overflow-hidden",
        "transition-all duration-300",
        "hover:shadow-[0_8px_24px_rgba(60,53,48,0.08)] hover:scale-[1.01]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-surface overflow-hidden">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
              />
            </svg>
          </div>
        )}

        {/* Fully funded badge */}
        {showFundedBadge && (
          <div className="absolute top-3 right-3 bg-accent text-text-on-primary font-body font-semibold text-xs px-3 py-1 rounded-full">
            {fundedLabel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Name */}
        <h3 className="font-body font-bold text-heading text-lg mb-1 line-clamp-1">
          {gift.name}
        </h3>

        {/* Description */}
        {gift.description && (
          <p className="font-body text-muted text-sm mb-3 line-clamp-2">
            {gift.description}
          </p>
        )}

        {isQuotesMode && (
          <div className="mb-3 rounded-lg border border-secondary/70 bg-surface/70 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-muted font-semibold">
              {quoteUnitLabel}
            </p>
            <p className="text-sm font-bold text-heading mt-0.5">
              {formatCurrency(gift.quoteUnitCents ?? 0, currency)}
            </p>
          </div>
        )}

        {(gift.showCollectedAmount || gift.showGoalAmount) && (
          <div
            className={[
              "mb-4 gap-2",
              gift.showCollectedAmount && gift.showGoalAmount
                ? "grid grid-cols-2"
                : "grid grid-cols-1",
            ].join(" ")}
          >
            {gift.showCollectedAmount && (
              <div className="rounded-lg border border-secondary/70 bg-surface/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                  {collectedTitle}
                </p>
                <p className="text-sm font-bold text-heading mt-0.5">
                  {formatCurrency(gift.collectedCents, currency)}
                </p>
              </div>
            )}
            {gift.showGoalAmount && (
              <div className="rounded-lg border border-secondary/70 bg-surface/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                  {goalTitle}
                </p>
                <p className="text-sm font-bold text-heading mt-0.5">
                  {formatCurrency(gift.priceCents, currency)}
                </p>
              </div>
            )}
          </div>
        )}

        {showProgress && (
          <>
            <div className="mb-1">
              <div className="bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full transition-all duration-500",
                    isFullyFunded ? "bg-primary" : "bg-accent",
                  ].join(" ")}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <p className="font-body text-muted text-xs mb-4">
              {progressLabel.replace("__PERCENT__", String(percent))}
            </p>
          </>
        )}

        {/* Contribute button */}
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onContribute?.(gift.id)}
        >
          {contributeLabel}
        </Button>
      </div>
    </div>
  );
}
