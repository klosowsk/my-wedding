const DEFAULT_APP_URL = "http://localhost:3333";

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function getPublicAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && configured.trim().length > 0) {
    return normalizeBaseUrl(configured);
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  return DEFAULT_APP_URL;
}
