export type LandingSectionKey = "countdown" | "venue" | "info" | "contact";

export interface LandingSections {
  countdown: boolean;
  venue: boolean;
  info: boolean;
  contact: boolean;
}

export interface PublicNavVisibility {
  giftsEnabled: boolean;
  galleryEnabled: boolean;
  landingSections: LandingSections;
}

export const PUBLIC_NAV_LINKS = [
  { key: "home", href: "" },
  { key: "countdown", href: "#countdown", section: "countdown" },
  { key: "venue", href: "#mapa", section: "venue" },
  { key: "info", href: "#informacoes", section: "info" },
  { key: "contact", href: "#contato", section: "contact" },
  { key: "gifts", href: "/gifts", feature: "giftsEnabled" },
  { key: "gallery", href: "/gallery", feature: "galleryEnabled" },
] as const;

export function getVisiblePublicNavLinks(visibility: PublicNavVisibility) {
  return PUBLIC_NAV_LINKS.filter((link) => {
    if ("feature" in link) return visibility[link.feature];
    if ("section" in link) return visibility.landingSections[link.section];
    return true;
  });
}
