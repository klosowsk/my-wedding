import { defineRouting } from "next-intl/routing";

export const locales = ["pt-BR", "en", "es"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "pt-BR",
  localePrefix: "always",
});
