const INTL_LOCALES: Record<string, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export function intlLocaleFor(locale: string): string {
  return INTL_LOCALES[locale] ?? "pt-BR";
}

/**
 * Format a date-only ISO string (YYYY-MM-DD) for display.
 * "long": "31 de dezembro de 2026" · "short": "31/12/2026" (locale-ordered).
 * Noon anchor avoids timezone day-shifts for date-only values.
 */
export function formatEventDate(
  isoDate: string,
  locale: string,
  style: "long" | "short" = "long"
): string {
  const date = new Date(`${isoDate}T12:00:00`);

  if (style === "short") {
    return new Intl.DateTimeFormat(intlLocaleFor(locale)).format(date);
  }

  return new Intl.DateTimeFormat(intlLocaleFor(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Localized pieces of a date-only ISO string, for the invite-style
 * date block (weekday | big day | month arch | year).
 */
export function getEventDateParts(isoDate: string, locale: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  const intl = intlLocaleFor(locale);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(intl, options).format(date);

  return {
    weekday: part({ weekday: "long" }),
    day: part({ day: "2-digit" }),
    month: part({ month: "long" }),
    year: part({ year: "numeric" }),
  };
}

/**
 * RSVP deadline is a date-only string (YYYY-MM-DD); it passes at the end of
 * that day in America/Sao_Paulo (fixed -03:00 — Brazil has no DST since 2019).
 */
export function isRsvpDeadlinePassed(
  deadline: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!deadline) return false;
  return now.getTime() > new Date(`${deadline}T23:59:59-03:00`).getTime();
}
