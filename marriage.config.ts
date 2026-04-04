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

  theme: {
    colors: {
      primary: "#B46942",
      primaryLight: "#C88A6A",
      primaryDark: "#9D5B39",
      secondary: "#D3BFA6",
      accent: "#6F714A",
      muted: "#9A9287",
      surface: "#ECE9D8",
      background: "#F7F4EE",
      warmWhite: "#FFFDF9",
      text: "#3C3530",
      textMuted: "#9A9287",
      textLight: "#B5AFA7",
      border: "#D3BFA6",
      borderLight: "#ECE9D8",
      success: "#6F714A",
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

  features: {
    rsvpEnabled: true,
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
