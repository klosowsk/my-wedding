import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";

import { pageService } from "@/src/services/page";
import { giftService } from "@/src/services/gift";
import { siteConfigService } from "@/src/services/site-config";
import PublicLayout from "@/components/public/PublicLayout";
import Hero from "@/components/public/Hero";
import Countdown from "@/components/public/Countdown";
import VenueSection from "@/components/public/VenueSection";
import ContactSection from "@/components/public/ContactSection";
import BotanicalDivider from "@/components/public/BotanicalDivider";
import { Card } from "@/components/ui/Card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const wedding = await siteConfigService.getWeddingConfig();
  const [name1, name2] = wedding.event.couple;
  const localeForDate = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  const dateLabel = new Intl.DateTimeFormat(localeForDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${wedding.event.date}T12:00:00`));

  return {
    title: `${name1} & ${name2} — ${dateLabel}`,
    description: t("hero.subtitle"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, infoPages, wedding, publicGifts] = await Promise.all([
    getTranslations(),
    pageService.listPublished(locale),
    siteConfigService.getWeddingConfig(),
    giftService.listPublic(locale),
  ]);

  const customSubtitle =
    locale === "en"
      ? wedding.copy.heroSubtitleEn
      : locale === "es"
        ? wedding.copy.heroSubtitleEs
        : wedding.copy.heroSubtitlePt;
  const heroSubtitle = customSubtitle?.trim() || t("hero.subtitle");

  const localeForDate = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  const dateLabel = new Intl.DateTimeFormat(localeForDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${wedding.event.date}T12:00:00`));
  const heroDate = `${dateLabel} • ${wedding.event.time}`;

  const hasGiftsEntry = wedding.features.giftsEnabled && publicGifts.length > 0;
  const hasVenueEntry =
    Boolean(wedding.event.venue.name?.trim()) && Boolean(wedding.event.venue.address?.trim());

  const secondaryHeroCtas = [
    hasGiftsEntry && { label: t("nav.gifts"), href: `/${locale}/gifts` },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <PublicLayout>

      {/* Hero Section */}
      <Hero
        subtitle={heroSubtitle}
        date={heroDate}
        venue={wedding.event.venue.name}
        cta={wedding.features.rsvpEnabled ? t("hero.cta") : undefined}
        couple={wedding.event.couple}
        rsvpHref={wedding.features.rsvpEnabled ? `/${locale}/rsvp` : undefined}
        secondaryCtas={secondaryHeroCtas}
      />

      <BotanicalDivider />

      {/* Countdown Section */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1024px] mx-auto px-6 md:px-12">
          <h2 className="font-script font-normal text-script text-3xl md:text-[2.5rem] text-center mb-8 tracking-wide">
            {t("countdown.title")}
          </h2>
          <Countdown
            targetDateTime={`${wedding.event.date}T${wedding.event.time}:00`}
          />
        </div>
      </section>

      {hasVenueEntry && (
        <>
          <BotanicalDivider />

          {/* Venue Section */}
          <section id="venue" className="py-14 md:py-20 scroll-mt-24">
            <VenueSection
              title={t("venue.title")}
              venueName={wedding.event.venue.name}
              address={wedding.event.venue.address}
              googleMapsUrl={wedding.event.venue.googleMapsUrl}
              googleMapsEmbedUrl={wedding.event.venue.googleMapsEmbedUrl}
              wazeUrl={wedding.event.venue.wazeUrl}
              directions={t("venue.directions")}
              wazeLabel={t("venue.waze")}
            />
          </section>
        </>
      )}

      {/* Info Cards Section */}
      {infoPages.length > 0 && (
        <>
          <BotanicalDivider />

          <section className="py-14 md:py-20">
            <div className="max-w-[1024px] mx-auto px-6 md:px-12">
              <h2 className="font-script font-normal text-script text-3xl md:text-[2.5rem] text-center mb-8 tracking-wide">
                {t("info.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {infoPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${locale}/info/${page.slug}`}
                    className="no-underline"
                  >
                    <Card hover className="h-full text-center p-6">
                      {page.icon && (
                        <span
                          className="text-3xl mb-3 block"
                          aria-hidden="true"
                        >
                          {page.icon}
                        </span>
                      )}
                      <h3 className="text-heading text-base font-semibold">
                        {page.title}
                      </h3>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <BotanicalDivider />

      {/* Contact Section */}
      <section className="py-14 md:py-20">
        <ContactSection
          title={t("contact.title")}
          subtitle={t("contact.subtitle")}
          phone={wedding.event.contact.phone}
          email={wedding.event.contact.email}
        />
      </section>

    </PublicLayout>
  );
}
