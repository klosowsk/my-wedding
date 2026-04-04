import { giftRepository } from "../repositories/gift";

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

/**
 * Returns a localized field value with fallback to Portuguese.
 * Looks up `record[fieldPrefix_locale]`, falling back to `record[fieldPrefix_pt]`.
 *
 * @example getLocalizedField(gift, "name", "en") → gift.nameEn ?? gift.namePt
 */
export function getLocalizedField(
  record: Record<string, unknown>,
  fieldPrefix: string,
  locale: string
): string {
  // Normalize locale: "pt-BR" → "pt_BR" → we use the mapping below
  // DB columns use suffixes: _pt, _en, _es
  const localeMap: Record<string, string> = {
    "pt-BR": "Pt",
    pt: "Pt",
    en: "En",
    es: "Es",
  };

  const suffix = localeMap[locale] ?? "Pt";
  const key = `${fieldPrefix}${suffix}`;
  const fallbackKey = `${fieldPrefix}Pt`;

  const value = record[key];
  if (value != null && value !== "") return value as string;

  const fallback = record[fallbackKey];
  return (fallback as string) ?? "";
}

export const giftService = {
  async listPublic(locale: string) {
    const gifts = await giftRepository.findPublicWithMedia();

    return gifts.map((gift) => {
      // Prefer media URL (S3), fallback to legacy imageUrl column
      const media = (gift as Record<string, unknown>).media as { url?: string; thumbUrl?: string } | null;
      const imageUrl = media?.url || gift.imageUrl;

      const contributionMode: "open" | "fixed" | "quotes" =
        gift.contributionMode === "fixed"
          ? "fixed"
          : gift.contributionMode === "quotes"
            ? "quotes"
            : "open";

      return {
        id: gift.id,
        name: getLocalizedField(gift as unknown as Record<string, unknown>, "name", locale),
        description: getLocalizedField(gift as unknown as Record<string, unknown>, "description", locale),
        priceCents: gift.priceCents,
        collectedCents: gift.collectedCents,
        imageUrl,
        category: gift.category,
        status: gift.status,
        sortOrder: gift.sortOrder,
        contributionMode,
        fixedContributionOptions: parseFixedContributionOptions(gift.fixedContributionOptions),
        quoteUnitCents: gift.quoteUnitCents,
        showCollectedAmount: gift.showCollectedAmount,
        showGoalAmount: gift.showGoalAmount,
        showFundedBadge: gift.showFundedBadge,
      };
    });
  },

  async getById(id: string) {
    const gift = await giftRepository.findById(id);
    return gift ?? null;
  },
};
