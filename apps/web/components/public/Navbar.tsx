"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/lib/i18n/routing";

const BASE_NAV_LINKS = [
  { key: "home" as const, href: "" },
  { key: "gifts" as const, href: "/gifts" },
  { key: "gallery" as const, href: "/gallery" },
] as const;

const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
  es: "ES",
};

export default function Navbar({
  className = "",
  couple,
  features,
}: {
  className?: string;
  couple: readonly [string, string];
  features: {
    giftsEnabled: boolean;
    galleryEnabled: boolean;
  };
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect current locale from pathname
  const currentLocale = (locales.find((l) => pathname.startsWith(`/${l}`)) ??
    "pt-BR") as Locale;
  const basePath = `/${currentLocale}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = BASE_NAV_LINKS.filter((link) => {
    if (link.key === "gifts") return features.giftsEnabled;
    if (link.key === "gallery") return features.galleryEnabled;
    return true;
  });

  function isActive(href: string) {
    const fullPath = `${basePath}${href}`;
    if (href === "") {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname.startsWith(fullPath);
  }

  function switchLocale(locale: Locale) {
    // Replace current locale prefix in the path
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "");
    window.location.href = `/${locale}${pathWithoutLocale || ""}`;
  }

  const [first, second] = couple;

  return (
    <>
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "bg-warm-white/90 backdrop-blur-md border-b border-secondary",
          "transition-shadow duration-300",
          scrolled ? "shadow-[0_2px_12px_rgba(60,53,48,0.06)]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 flex items-center justify-between h-16 md:h-18">
          {/* Left: couple names */}
          <Link
            href={basePath}
            className="font-script text-script text-2xl md:text-3xl tracking-wide leading-none hover:no-underline"
          >
            <span className="md:hidden">
              {first[0]} & {second[0]}
            </span>
            <span className="hidden md:inline">
              {first} & {second}
            </span>
          </Link>

          {/* Center/Right: nav links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={`${basePath}${link.href}`}
                className={[
                  "font-body font-medium text-sm uppercase tracking-[0.1em] transition-colors duration-200",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-body hover:text-primary",
                ].join(" ")}
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Language switcher (desktop) */}
            <div className="flex items-center gap-1 ml-4 border-l border-secondary pl-4">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className={[
                    "px-2 py-1 text-sm font-body font-semibold rounded-md transition-colors duration-200 cursor-pointer",
                    currentLocale === locale
                      ? "text-primary bg-primary-faint"
                      : "text-muted hover:text-body hover:bg-surface",
                  ].join(" ")}
                >
                  {LOCALE_LABELS[locale]}
                </button>
              ))}
            </div>
          </div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={[
                "block w-6 h-0.5 bg-body transition-all duration-300",
                menuOpen ? "rotate-45 translate-y-2" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-6 h-0.5 bg-body transition-all duration-300",
                menuOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-6 h-0.5 bg-body transition-all duration-300",
                menuOpen ? "-rotate-45 -translate-y-2" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-warm-white flex flex-col items-center justify-center gap-8 md:hidden">
          {/* Close area above nav height */}
          <div className="absolute top-0 left-0 right-0 h-16" />

          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={`${basePath}${link.href}`}
              className={[
                "font-body font-medium text-lg uppercase tracking-[0.15em] transition-colors duration-200",
                isActive(link.href)
                  ? "text-primary"
                  : "text-body hover:text-primary",
              ].join(" ")}
            >
              {t(link.key)}
            </Link>
          ))}

          {/* Language switcher (mobile) */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-secondary">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={[
                  "px-3 py-2 text-base font-body font-semibold rounded-lg transition-colors duration-200 cursor-pointer",
                  currentLocale === locale
                    ? "text-primary bg-primary-faint"
                    : "text-muted hover:text-body hover:bg-surface",
                ].join(" ")}
              >
                {LOCALE_LABELS[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
