import { config as staticConfig } from "@/lib/config";
import { siteConfigRepository } from "../repositories/site-config";

const SITE_CONFIG_KEYS = {
  coupleName1: "couple_name_1",
  coupleName2: "couple_name_2",
  eventDate: "event_date",
  eventTime: "event_time",
  venueName: "venue_name",
  venueAddress: "venue_address",
  venueGoogleMapsUrl: "venue_google_maps_url",
  venueGoogleMapsEmbedUrl: "google_maps_embed_url",
  venueWazeUrl: "venue_waze_url",
  contactPhone: "contact_phone",
  contactEmail: "contact_email",
  pixKey: "pix_key",
  pixName: "pix_name",
  pixCity: "pix_city",
  stripeEnabled: "stripe_enabled",
  pixEnabled: "pix_enabled",
  rsvpEnabled: "rsvp_enabled",
  giftsEnabled: "gifts_enabled",
  galleryEnabled: "gallery_enabled",
  maxPlusOnes: "max_plus_ones",
  currencyCode: "currency_code",
  currencyLocale: "currency_locale",
  rsvpDeadline: "rsvp_deadline",
  inviteImageUrl: "invite_image_url",
  heroSubtitlePt: "hero_subtitle_pt",
  heroSubtitleEn: "hero_subtitle_en",
  heroSubtitleEs: "hero_subtitle_es",
} as const;

export interface SiteSettings {
  coupleName1: string;
  coupleName2: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueGoogleMapsUrl: string | null;
  venueGoogleMapsEmbedUrl: string | null;
  venueWazeUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  pixKey: string | null;
  pixName: string | null;
  pixCity: string | null;
  stripeEnabled: boolean;
  pixEnabled: boolean;
  rsvpEnabled: boolean;
  giftsEnabled: boolean;
  galleryEnabled: boolean;
  maxPlusOnes: number;
  currencyCode: string;
  currencyLocale: string;
  rsvpDeadline: string | null;
  inviteImageUrl: string | null;
  heroSubtitlePt: string | null;
  heroSubtitleEn: string | null;
  heroSubtitleEs: string | null;
}

type SiteConfigRowMap = Map<string, string | null>;

const DEFAULT_SETTINGS: SiteSettings = {
  coupleName1: staticConfig.event.couple[0],
  coupleName2: staticConfig.event.couple[1],
  eventDate: staticConfig.event.date,
  eventTime: staticConfig.event.time,
  venueName: staticConfig.event.venue.name,
  venueAddress: staticConfig.event.venue.address,
  venueGoogleMapsUrl: staticConfig.event.venue.googleMapsUrl,
  venueGoogleMapsEmbedUrl: staticConfig.event.venue.googleMapsEmbedUrl,
  venueWazeUrl: staticConfig.event.venue.wazeUrl,
  contactPhone: staticConfig.event.contact.phone,
  contactEmail: staticConfig.event.contact.email,
  pixKey: null,
  pixName: `${staticConfig.event.couple[0]} e ${staticConfig.event.couple[1]}`,
  pixCity: "",
  stripeEnabled: staticConfig.features.stripe.enabled,
  pixEnabled: staticConfig.features.pix.enabled,
  rsvpEnabled: staticConfig.features.rsvpEnabled,
  giftsEnabled: staticConfig.features.giftsEnabled,
  galleryEnabled: staticConfig.features.galleryEnabled,
  maxPlusOnes: staticConfig.features.maxPlusOnes,
  currencyCode: staticConfig.currency.code,
  currencyLocale: staticConfig.currency.locale,
  rsvpDeadline: null,
  inviteImageUrl: null,
  heroSubtitlePt: null,
  heroSubtitleEn: null,
  heroSubtitleEs: null,
};

const PUBLIC_CONFIG_KEYS = [
  "pix_key",
  "pix_name",
  "pix_city",
  "stripe_enabled",
  "pix_enabled",
  "rsvp_enabled",
  "gifts_enabled",
  "gallery_enabled",
  "max_plus_ones",
  "currency_code",
  "currency_locale",
  "contact_phone",
  "contact_email",
  "rsvp_deadline",
  "google_maps_embed_url",
  "invite_image_url",
] as const;

function normalizeNullableString(value: string | null): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRequiredString(value: string): string {
  return value.trim();
}

function parseBoolean(value: string | null | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback;

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;

  return fallback;
}

function parseInteger(value: string | null | undefined, fallback: number): number {
  if (value == null || value === "") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readRaw(rowMap: SiteConfigRowMap, key: string): string | null | undefined {
  return rowMap.has(key) ? rowMap.get(key) : undefined;
}

function readRequiredString(
  rowMap: SiteConfigRowMap,
  key: string,
  fallback: string
): string {
  const raw = readRaw(rowMap, key);
  if (raw == null) return fallback;
  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function readNullableString(
  rowMap: SiteConfigRowMap,
  key: string,
  fallback: string | null
): string | null {
  const raw = readRaw(rowMap, key);

  // Missing key: fallback to static config default.
  if (raw === undefined) return fallback;

  // Existing key with null/empty value: intentionally cleared.
  if (raw == null) return null;

  const normalized = raw.trim();
  return normalized.length > 0 ? normalized : null;
}

function toSiteSettings(rows: { key: string; value: string | null }[]): SiteSettings {
  const rowMap: SiteConfigRowMap = new Map(rows.map((row) => [row.key, row.value]));

  return {
    coupleName1: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.coupleName1,
      DEFAULT_SETTINGS.coupleName1
    ),
    coupleName2: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.coupleName2,
      DEFAULT_SETTINGS.coupleName2
    ),
    eventDate: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.eventDate,
      DEFAULT_SETTINGS.eventDate
    ),
    eventTime: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.eventTime,
      DEFAULT_SETTINGS.eventTime
    ),
    venueName: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.venueName,
      DEFAULT_SETTINGS.venueName
    ),
    venueAddress: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.venueAddress,
      DEFAULT_SETTINGS.venueAddress
    ),
    venueGoogleMapsUrl: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.venueGoogleMapsUrl,
      DEFAULT_SETTINGS.venueGoogleMapsUrl
    ),
    venueGoogleMapsEmbedUrl: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.venueGoogleMapsEmbedUrl,
      DEFAULT_SETTINGS.venueGoogleMapsEmbedUrl
    ),
    venueWazeUrl: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.venueWazeUrl,
      DEFAULT_SETTINGS.venueWazeUrl
    ),
    contactPhone: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.contactPhone,
      DEFAULT_SETTINGS.contactPhone
    ),
    contactEmail: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.contactEmail,
      DEFAULT_SETTINGS.contactEmail
    ),
    pixKey: readNullableString(rowMap, SITE_CONFIG_KEYS.pixKey, DEFAULT_SETTINGS.pixKey),
    pixName: readNullableString(rowMap, SITE_CONFIG_KEYS.pixName, DEFAULT_SETTINGS.pixName),
    pixCity: readNullableString(rowMap, SITE_CONFIG_KEYS.pixCity, DEFAULT_SETTINGS.pixCity),
    stripeEnabled: parseBoolean(
      readRaw(rowMap, SITE_CONFIG_KEYS.stripeEnabled),
      DEFAULT_SETTINGS.stripeEnabled
    ),
    pixEnabled: parseBoolean(
      readRaw(rowMap, SITE_CONFIG_KEYS.pixEnabled),
      DEFAULT_SETTINGS.pixEnabled
    ),
    rsvpEnabled: parseBoolean(
      readRaw(rowMap, SITE_CONFIG_KEYS.rsvpEnabled),
      DEFAULT_SETTINGS.rsvpEnabled
    ),
    giftsEnabled: parseBoolean(
      readRaw(rowMap, SITE_CONFIG_KEYS.giftsEnabled),
      DEFAULT_SETTINGS.giftsEnabled
    ),
    galleryEnabled: parseBoolean(
      readRaw(rowMap, SITE_CONFIG_KEYS.galleryEnabled),
      DEFAULT_SETTINGS.galleryEnabled
    ),
    maxPlusOnes: parseInteger(
      readRaw(rowMap, SITE_CONFIG_KEYS.maxPlusOnes),
      DEFAULT_SETTINGS.maxPlusOnes
    ),
    currencyCode: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.currencyCode,
      DEFAULT_SETTINGS.currencyCode
    ),
    currencyLocale: readRequiredString(
      rowMap,
      SITE_CONFIG_KEYS.currencyLocale,
      DEFAULT_SETTINGS.currencyLocale
    ),
    rsvpDeadline: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.rsvpDeadline,
      DEFAULT_SETTINGS.rsvpDeadline
    ),
    inviteImageUrl: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.inviteImageUrl,
      DEFAULT_SETTINGS.inviteImageUrl
    ),
    heroSubtitlePt: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.heroSubtitlePt,
      DEFAULT_SETTINGS.heroSubtitlePt
    ),
    heroSubtitleEn: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.heroSubtitleEn,
      DEFAULT_SETTINGS.heroSubtitleEn
    ),
    heroSubtitleEs: readNullableString(
      rowMap,
      SITE_CONFIG_KEYS.heroSubtitleEs,
      DEFAULT_SETTINGS.heroSubtitleEs
    ),
  };
}

function toStoragePatch(
  patch: Partial<SiteSettings>
): Record<string, string | null> {
  const entries: Record<string, string | null> = {};

  if ("coupleName1" in patch && patch.coupleName1 !== undefined) {
    entries[SITE_CONFIG_KEYS.coupleName1] = normalizeRequiredString(patch.coupleName1);
  }
  if ("coupleName2" in patch && patch.coupleName2 !== undefined) {
    entries[SITE_CONFIG_KEYS.coupleName2] = normalizeRequiredString(patch.coupleName2);
  }
  if ("eventDate" in patch && patch.eventDate !== undefined) {
    entries[SITE_CONFIG_KEYS.eventDate] = normalizeRequiredString(patch.eventDate);
  }
  if ("eventTime" in patch && patch.eventTime !== undefined) {
    entries[SITE_CONFIG_KEYS.eventTime] = normalizeRequiredString(patch.eventTime);
  }
  if ("venueName" in patch && patch.venueName !== undefined) {
    entries[SITE_CONFIG_KEYS.venueName] = normalizeRequiredString(patch.venueName);
  }
  if ("venueAddress" in patch && patch.venueAddress !== undefined) {
    entries[SITE_CONFIG_KEYS.venueAddress] = normalizeRequiredString(patch.venueAddress);
  }
  if ("venueGoogleMapsUrl" in patch && patch.venueGoogleMapsUrl !== undefined) {
    entries[SITE_CONFIG_KEYS.venueGoogleMapsUrl] = normalizeNullableString(
      patch.venueGoogleMapsUrl
    );
  }
  if (
    "venueGoogleMapsEmbedUrl" in patch &&
    patch.venueGoogleMapsEmbedUrl !== undefined
  ) {
    entries[SITE_CONFIG_KEYS.venueGoogleMapsEmbedUrl] = normalizeNullableString(
      patch.venueGoogleMapsEmbedUrl
    );
  }
  if ("venueWazeUrl" in patch && patch.venueWazeUrl !== undefined) {
    entries[SITE_CONFIG_KEYS.venueWazeUrl] = normalizeNullableString(patch.venueWazeUrl);
  }
  if ("contactPhone" in patch && patch.contactPhone !== undefined) {
    entries[SITE_CONFIG_KEYS.contactPhone] = normalizeNullableString(patch.contactPhone);
  }
  if ("contactEmail" in patch && patch.contactEmail !== undefined) {
    entries[SITE_CONFIG_KEYS.contactEmail] = normalizeNullableString(patch.contactEmail);
  }
  if ("pixKey" in patch && patch.pixKey !== undefined) {
    entries[SITE_CONFIG_KEYS.pixKey] = normalizeNullableString(patch.pixKey);
  }
  if ("pixName" in patch && patch.pixName !== undefined) {
    entries[SITE_CONFIG_KEYS.pixName] = normalizeNullableString(patch.pixName);
  }
  if ("pixCity" in patch && patch.pixCity !== undefined) {
    entries[SITE_CONFIG_KEYS.pixCity] = normalizeNullableString(patch.pixCity);
  }
  if ("stripeEnabled" in patch && patch.stripeEnabled !== undefined) {
    entries[SITE_CONFIG_KEYS.stripeEnabled] = patch.stripeEnabled ? "true" : "false";
  }
  if ("pixEnabled" in patch && patch.pixEnabled !== undefined) {
    entries[SITE_CONFIG_KEYS.pixEnabled] = patch.pixEnabled ? "true" : "false";
  }
  if ("rsvpEnabled" in patch && patch.rsvpEnabled !== undefined) {
    entries[SITE_CONFIG_KEYS.rsvpEnabled] = patch.rsvpEnabled ? "true" : "false";
  }
  if ("giftsEnabled" in patch && patch.giftsEnabled !== undefined) {
    entries[SITE_CONFIG_KEYS.giftsEnabled] = patch.giftsEnabled ? "true" : "false";
  }
  if ("galleryEnabled" in patch && patch.galleryEnabled !== undefined) {
    entries[SITE_CONFIG_KEYS.galleryEnabled] = patch.galleryEnabled ? "true" : "false";
  }
  if ("maxPlusOnes" in patch && patch.maxPlusOnes !== undefined) {
    entries[SITE_CONFIG_KEYS.maxPlusOnes] = String(patch.maxPlusOnes);
  }
  if ("currencyCode" in patch && patch.currencyCode !== undefined) {
    entries[SITE_CONFIG_KEYS.currencyCode] = normalizeRequiredString(
      patch.currencyCode.toUpperCase()
    );
  }
  if ("currencyLocale" in patch && patch.currencyLocale !== undefined) {
    entries[SITE_CONFIG_KEYS.currencyLocale] = normalizeRequiredString(
      patch.currencyLocale
    );
  }
  if ("rsvpDeadline" in patch && patch.rsvpDeadline !== undefined) {
    entries[SITE_CONFIG_KEYS.rsvpDeadline] = normalizeNullableString(patch.rsvpDeadline);
  }
  if ("inviteImageUrl" in patch && patch.inviteImageUrl !== undefined) {
    entries[SITE_CONFIG_KEYS.inviteImageUrl] = normalizeNullableString(patch.inviteImageUrl);
  }
  if ("heroSubtitlePt" in patch && patch.heroSubtitlePt !== undefined) {
    entries[SITE_CONFIG_KEYS.heroSubtitlePt] = normalizeNullableString(patch.heroSubtitlePt);
  }
  if ("heroSubtitleEn" in patch && patch.heroSubtitleEn !== undefined) {
    entries[SITE_CONFIG_KEYS.heroSubtitleEn] = normalizeNullableString(patch.heroSubtitleEn);
  }
  if ("heroSubtitleEs" in patch && patch.heroSubtitleEs !== undefined) {
    entries[SITE_CONFIG_KEYS.heroSubtitleEs] = normalizeNullableString(patch.heroSubtitleEs);
  }

  return entries;
}

export const siteConfigService = {
  async getSettings(): Promise<SiteSettings> {
    const rows = await siteConfigRepository.getAll();
    return toSiteSettings(rows);
  },

  async updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const entries = toStoragePatch(patch);

    if (Object.keys(entries).length > 0) {
      await siteConfigRepository.setMany(entries);
    }

    return this.getSettings();
  },

  async getWeddingConfig() {
    const settings = await this.getSettings();

    return {
      event: {
        couple: [settings.coupleName1, settings.coupleName2] as const,
        date: settings.eventDate,
        time: settings.eventTime,
        venue: {
          name: settings.venueName,
          address: settings.venueAddress,
          googleMapsUrl: settings.venueGoogleMapsUrl,
          googleMapsEmbedUrl: settings.venueGoogleMapsEmbedUrl,
          wazeUrl: settings.venueWazeUrl,
        },
        contact: {
          phone: settings.contactPhone,
          email: settings.contactEmail,
        },
      },
      currency: {
        code: settings.currencyCode,
        locale: settings.currencyLocale,
      },
      features: {
        rsvpEnabled: settings.rsvpEnabled,
        giftsEnabled: settings.giftsEnabled,
        galleryEnabled: settings.galleryEnabled,
        pix: { enabled: settings.pixEnabled },
        stripe: { enabled: settings.stripeEnabled },
        maxPlusOnes: settings.maxPlusOnes,
      },
      copy: {
        heroSubtitlePt: settings.heroSubtitlePt,
        heroSubtitleEn: settings.heroSubtitleEn,
        heroSubtitleEs: settings.heroSubtitleEs,
      },
    };
  },

  async getPublicConfig() {
    const settings = await this.getSettings();

    const values: Record<(typeof PUBLIC_CONFIG_KEYS)[number], string | null> = {
      pix_key: settings.pixKey,
      pix_name: settings.pixName,
      pix_city: settings.pixCity,
      stripe_enabled: settings.stripeEnabled ? "true" : "false",
      pix_enabled: settings.pixEnabled ? "true" : "false",
      rsvp_enabled: settings.rsvpEnabled ? "true" : "false",
      gifts_enabled: settings.giftsEnabled ? "true" : "false",
      gallery_enabled: settings.galleryEnabled ? "true" : "false",
      max_plus_ones: String(settings.maxPlusOnes),
      currency_code: settings.currencyCode,
      currency_locale: settings.currencyLocale,
      contact_phone: settings.contactPhone,
      contact_email: settings.contactEmail,
      rsvp_deadline: settings.rsvpDeadline,
      google_maps_embed_url: settings.venueGoogleMapsEmbedUrl,
      invite_image_url: settings.inviteImageUrl,
    };

    return values;
  },
};
