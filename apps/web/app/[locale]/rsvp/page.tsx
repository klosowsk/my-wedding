import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import PublicLayout from "@/components/public/PublicLayout";
import { siteConfigService } from "@/src/services/site-config";
import RSVPCodeForm from "@/components/public/RSVPCodeForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, wedding] = await Promise.all([
    getTranslations({ locale, namespace: "rsvp" }),
    siteConfigService.getWeddingConfig(),
  ]);
  const [name1, name2] = wedding.event.couple;

  return {
    title: `${t("title")} — ${name1} & ${name2}`,
    description: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function RSVPFallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, wedding] = await Promise.all([
    getTranslations("rsvp"),
    siteConfigService.getWeddingConfig(),
  ]);

  if (!wedding.features.rsvpEnabled) {
    notFound();
  }

  return (
    <PublicLayout>

      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <h1 className="font-script font-normal text-script text-3xl md:text-[2.5rem] tracking-wide mb-3">
            {t("title")}
          </h1>

          <p className="text-muted text-base mb-8">
            {t("noToken")}
          </p>

          <div className="mb-8">
            <RSVPCodeForm locale={locale} />
          </div>

          <Link
            href={`/${locale}`}
            className="inline-block border border-primary text-primary font-semibold rounded-full px-8 py-3 text-sm hover:bg-primary hover:text-text-on-primary transition-all duration-200"
          >
            {t("backHome")}
          </Link>
        </div>
      </section>

    </PublicLayout>
  );
}
