"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/lib/i18n/routing";

export default function Footer({
  className = "",
  couple,
  eventDate,
  venueName,
  features,
}: {
  className?: string;
  couple: readonly [string, string];
  eventDate: string;
  venueName: string;
  features: {
    giftsEnabled: boolean;
    galleryEnabled: boolean;
  };
}) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const [first, second] = couple;

  const currentLocale = (locales.find((l) => pathname.startsWith(`/${l}`)) ??
    "pt-BR") as Locale;
  const basePath = `/${currentLocale}`;

  return (
    <footer
      className={[
        "bg-surface border-t border-secondary py-10 md:py-12 relative overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Subtle botanical accent */}
      <img
        src="/assets/vectors/leaves-bottom-right.svg"
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute -bottom-8 -right-8 w-28 opacity-8 pointer-events-none select-none"
      />

      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        {/* Couple names */}
        <p className="font-script text-primary text-2xl md:text-3xl tracking-wide text-center mb-2">
          {first} & {second}
        </p>

        {/* Date & Venue */}
        <p className="font-body text-muted text-sm text-center mb-6">
          {eventDate.split("-").reverse().join(".")} &middot; {venueName}
        </p>

        {/* Nav links */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <Link
            href={basePath}
            className="font-body text-sm text-muted hover:text-primary transition-colors duration-200"
          >
            {tNav("home")}
          </Link>
          {features.giftsEnabled && (
            <Link
              href={`${basePath}/gifts`}
              className="font-body text-sm text-muted hover:text-primary transition-colors duration-200"
            >
              {tNav("gifts")}
            </Link>
          )}
          {features.galleryEnabled && (
            <Link
              href={`${basePath}/gallery`}
              className="font-body text-sm text-muted hover:text-primary transition-colors duration-200"
            >
              {tNav("gallery")}
            </Link>
          )}
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-secondary mx-auto mb-4" />

        {/* Made with love */}
        <p className="font-body text-muted-light text-xs text-center">
          {t("madeWith")} ❤️
        </p>
      </div>
    </footer>
  );
}
