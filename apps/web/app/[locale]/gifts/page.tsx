import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { giftService } from "@/src/services/gift";
import { siteConfigService } from "@/src/services/site-config";
import PublicLayout from "@/components/public/PublicLayout";
import GiftsWithPayment from "@/components/public/GiftsWithPayment";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gifts" });
  const wedding = await siteConfigService.getWeddingConfig();
  const [name1, name2] = wedding.event.couple;

  return {
    title: `${t("title")} — ${name1} & ${name2}`,
    description: t("subtitle"),
  };
}

export default async function GiftsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, gifts, wedding] = await Promise.all([
    getTranslations("gifts"),
    giftService.listPublic(locale),
    siteConfigService.getWeddingConfig(),
  ]);

  if (!wedding.features.giftsEnabled) {
    notFound();
  }

  const fallbackLabelsByLocale: Record<
    string,
    { collected: string; goal: string; quoteUnit: string }
  > = {
    "pt-BR": {
      collected: "Arrecadado: {amount}",
      goal: "Meta: {amount}",
      quoteUnit: "Valor da cota",
    },
    en: {
      collected: "Collected: {amount}",
      goal: "Goal: {amount}",
      quoteUnit: "Quote value",
    },
    es: {
      collected: "Recaudado: {amount}",
      goal: "Meta: {amount}",
      quoteUnit: "Valor de cuota",
    },
  };

  const localeFallback =
    fallbackLabelsByLocale[locale] ?? fallbackLabelsByLocale["pt-BR"]!;

  const rawCollectedLabel = t("collected", { amount: "{amount}" });
  const rawGoalLabel = t("goal", { amount: "{amount}" });
  const rawQuoteUnitLabel = t("quoteUnit");

  const collectedLabel =
    rawCollectedLabel === "collected" || rawCollectedLabel === "gifts.collected"
      ? localeFallback.collected
      : rawCollectedLabel;
  const goalLabel =
    rawGoalLabel === "goal" || rawGoalLabel === "gifts.goal"
      ? localeFallback.goal
      : rawGoalLabel;
  const quoteUnitLabel =
    rawQuoteUnitLabel === "quoteUnit" ||
    rawQuoteUnitLabel === "gifts.quoteUnit"
      ? localeFallback.quoteUnit
      : rawQuoteUnitLabel;

  return (
    <PublicLayout>

      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="font-script font-normal text-script text-4xl md:text-[3rem] tracking-wide mb-3">
              {t("title")}
            </h1>
            <p className="text-muted text-sm md:text-base max-w-[500px] mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="w-16 h-px bg-secondary mx-auto mt-4" />
          </div>

          {/* Gift Grid with Payment Modal */}
          <GiftsWithPayment
            gifts={gifts}
            contributeLabel={t("contribute")}
            fundedLabel={t("funded")}
            progressLabel={t("progress")}
            collectedLabel={collectedLabel}
            goalLabel={goalLabel}
            quoteUnitLabel={quoteUnitLabel}
            locale={locale}
            currency={wedding.currency}
          />
        </div>
      </section>

    </PublicLayout>
  );
}
