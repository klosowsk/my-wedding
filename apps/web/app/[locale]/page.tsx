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
import SectionTitle from "@/components/public/SectionTitle";
import { Card } from "@/components/ui/Card";
import { formatEventDate, getEventDateParts } from "@/lib/dates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const wedding = await siteConfigService.getWeddingConfig();
  const [name1, name2] = wedding.event.couple;
  const dateLabel = formatEventDate(wedding.event.date, locale);

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

  const heroDateParts = getEventDateParts(wedding.event.date, locale);

  const hasGiftsEntry = wedding.features.giftsEnabled && publicGifts.length > 0;
  const hasVenueEntry =
    Boolean(wedding.event.venue.name?.trim()) && Boolean(wedding.event.venue.address?.trim());
  const hasContactInfo =
    Boolean(wedding.event.contact.phone) || Boolean(wedding.event.contact.email);

  const secondaryHeroCtas = [
    hasGiftsEntry && { label: t("nav.gifts"), href: `/${locale}/gifts` },
  ].filter(Boolean) as Array<{ label: string; href: string }>;
  const rsvpHref = wedding.features.rsvpExternalUrl ?? `/${locale}/rsvp`;

  return (
    <PublicLayout>

      {/* Hero Section */}
      <Hero
        id="inicio"
        eyebrow={t("hero.eyebrow")}
        subtitle={heroSubtitle}
        joiner={t("common.and")}
        dateParts={heroDateParts}
        timeLabel={t("hero.timeAt", { time: wedding.event.time })}
        venue={wedding.event.venue.name}
        cta={wedding.features.rsvpEnabled ? t("hero.cta") : undefined}
        couple={wedding.event.couple}
        rsvpHref={wedding.features.rsvpEnabled ? rsvpHref : undefined}
        secondaryCtas={secondaryHeroCtas}
      />

      <BotanicalDivider />

      {/* Info Cards Section (moved above the countdown) */}
      {infoPages.length > 0 && (
        <>
          <section id="informacoes" className="py-14 md:py-20 scroll-mt-24">
            <div className="max-w-[1024px] mx-auto px-6 md:px-12">
              <div className="text-center mb-8">
                <SectionTitle>{t("info.title")}</SectionTitle>
                <div className="w-16 h-px bg-secondary mx-auto mt-4" />
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {infoPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${locale}/info/${page.slug}`}
                    className="no-underline basis-full md:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)]"
                  >
                    <Card hover className="h-full text-center p-6">
                      {page.icon && (
                        <span
                          className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 text-2xl"
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

          <BotanicalDivider />
        </>
      )}

      {/* Countdown Section */}
      <section id="countdown" className="py-14 md:py-20 scroll-mt-24">
        <div className="max-w-[1024px] mx-auto px-6 md:px-12">
          <div className="text-center mb-8">
            <SectionTitle>{t("countdown.title")}</SectionTitle>
            <div className="w-16 h-px bg-secondary mx-auto mt-4" />
          </div>
          <Countdown
            targetDateTime={`${wedding.event.date}T${wedding.event.time}:00`}
          />
        </div>
      </section>

      {hasVenueEntry && (
        <>
          <BotanicalDivider />

          {/* Venue Section */}
          <section id="mapa" className="py-14 md:py-20 scroll-mt-24">
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

      {hasContactInfo && (
        <>
          <BotanicalDivider />

          {/* Contact Section */}
          <section id="contato" className="py-14 md:py-20 scroll-mt-24">
            <ContactSection
              title={t("contact.title")}
              subtitle={t("contact.subtitle")}
              phone={wedding.event.contact.phone}
              email={wedding.event.contact.email}
              whatsappMessage={t("contact.whatsapp")}
            />
          </section>
        </>
      )}

    </PublicLayout>
  );
}
