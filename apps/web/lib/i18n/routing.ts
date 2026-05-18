import { defineRouting } from "next-intl/routing";

import { config } from "../config";

export const locales = ["pt-BR", "en", "es"] as const;
export type Locale = (typeof locales)[number];

const defaultLocale: Locale = config.i18n.defaultLocale;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: config.i18n.localeDetection,
});
