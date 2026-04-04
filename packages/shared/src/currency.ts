import { config } from "../../../marriage.config";

interface CurrencyOptions {
  locale?: string;
  code?: string;
}

function resolveCurrencyOptions(options?: CurrencyOptions) {
  return {
    locale: options?.locale ?? config.currency.locale,
    code: options?.code ?? config.currency.code,
  };
}

/**
 * Format an integer amount (in smallest currency unit, e.g. cents)
 * into a localized currency string.
 */
export function formatCurrency(cents: number, options?: CurrencyOptions): string {
  const { locale, code } = resolveCurrencyOptions(options);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
  }).format(cents / 100);
}

/**
 * Get the currency symbol (e.g. "R$", "$", "€").
 */
export function getCurrencySymbol(options?: CurrencyOptions): string {
  const { locale, code } = resolveCurrencyOptions(options);

  return (
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? code
  );
}

/**
 * Get the ISO 4217 currency code.
 */
export function getCurrencyCode(options?: CurrencyOptions): string {
  return resolveCurrencyOptions(options).code;
}
