import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { giftService } from "@/src/services/gift";
import { siteConfigService } from "@/src/services/site-config";
import PublicLayout from "@/components/public/PublicLayout";
import GiftsWithPayment from "@/components/public/GiftsWithPayment";
import { EmptyState } from "@/components/ui/EmptyState";

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
          {gifts.length === 0 ? (
            <EmptyState message={t("empty")} className="max-w-[500px] mx-auto" />
          ) : (
            <GiftsWithPayment
              gifts={gifts}
              locale={locale}
              currency={wedding.currency}
            />
          )}
        </div>
      </section>

    </PublicLayout>
  );
}
