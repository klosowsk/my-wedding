import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { guestService } from "@/src/services/guest";
import { siteConfigService } from "@/src/services/site-config";
import PublicLayout from "@/components/public/PublicLayout";
import RSVPForm from "@/components/public/RSVPForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
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

export default async function RSVPPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  const [t, guest, wedding] = await Promise.all([
    getTranslations("rsvp"),
    guestService.getByToken(token),
    siteConfigService.getWeddingConfig(),
  ]);

  if (!wedding.features.rsvpEnabled) {
    notFound();
  }

  return (
    <PublicLayout>

      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[600px] mx-auto px-6 md:px-12">
          {guest ? (
            <RSVPForm guest={guest as any} locale={locale} />
          ) : (
            <div className="corner-frame bg-warm-white border border-secondary rounded-2xl p-8 md:p-12 text-center shadow-[0_4px_16px_rgba(60,53,48,0.06)]">
              <h1 className="font-script font-normal text-script text-3xl md:text-[2.5rem] tracking-wide mb-4">
                {t("title")}
              </h1>
              <p className="text-muted text-base mb-6">
                {t("invalidToken")}
              </p>
              <Link
                href={`/${locale}`}
                className="inline-block bg-primary text-text-on-primary font-semibold rounded-full px-8 py-3 text-base hover:bg-primary-hover hover:-translate-y-px transition-all duration-200"
              >
                {t("viewGifts")}
              </Link>
            </div>
          )}
        </div>
      </section>

    </PublicLayout>
  );
}
