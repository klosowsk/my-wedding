// Static fallback config.
// Runtime values are primarily managed via Admin Settings (site_config table).
export const config = {
  event: {
    couple: ["Partner 1", "Partner 2"] as const,
    date: "2026-12-31",
    time: "16:00",
    venue: {
      name: "Wedding Venue",
      address: "123 Celebration Street, Your City",
      googleMapsUrl: null,
      googleMapsEmbedUrl: null,
      wazeUrl: null,
    },
    contact: {
      phone: "+55 00 00000-0000",
      email: "wedding@example.com",
    },
  },

  // Mirrors the invite palette tokens in apps/web/app/globals.css (:root).
  theme: {
    colors: {
      primary: "#B46942",
      primaryLight: "#C98663",
      primaryDark: "#9D5B39",
      secondary: "#D6B49A",
      accent: "#7A8364",
      script: "#7A8364",
      muted: "#9A9287",
      surface: "#EFE8DC",
      background: "#F5F1E8",
      warmWhite: "#FBF8F2",
      text: "#3C3530",
      textMuted: "#9A9287",
      textLight: "#B5AFA7",
      border: "#D6B49A",
      borderLight: "#EFE8DC",
      success: "#7A8364",
      error: "#C44536",
      warning: "#D4A843",
    },
    fonts: {
      script: "Great Vibes",
      body: "Raleway",
    },
    borderRadius: "0.75rem",
  },

  currency: {
    code: "BRL",
    locale: "pt-BR",
  },

  i18n: {
    defaultLocale: "pt-BR",
    localeDetection: false,
  },

  features: {
    rsvpEnabled: true,
    rsvpExternalUrl: null,
    giftsEnabled: true,
    galleryEnabled: true,
    pix: { enabled: true },
    stripe: { enabled: true },
    maxPlusOnes: 4,
  },

  admin: {
    emails: ["admin@example.com"],
  },
} as const;

export type MarriageConfig = typeof config;
