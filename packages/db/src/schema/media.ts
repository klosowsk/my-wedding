import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { mediaStatusEnum } from "./enums";

/**
 * Media — centralized image storage metadata.
 *
 * Every uploaded file gets a row here. On upload, the server:
 * - Strips EXIF (privacy), auto-rotates
 * - Converts to WebP, resizes to max 1600px
 * - Generates a thumbnail (400px)
 * - Computes blurhash placeholder
 * - Uploads original (WebP) + thumb to S3/MinIO/R2
 *
 * Processing is synchronous (admin-only, single image at a time).
 */
export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),

  // S3 object keys
  key: text("key").notNull().unique(),
  thumbKey: text("thumb_key"),

  // Public URLs (derived from S3_PUBLIC_URL + key)
  url: text("url").notNull(),
  thumbUrl: text("thumb_url"),

  // File metadata
  contentType: text("content_type").notNull(),
  originalName: text("original_name"),
  size: integer("size"),

  // Image dimensions (set after processing)
  width: integer("width"),
  height: integer("height"),

  // Blurhash placeholder (set after processing)
  blurhash: text("blurhash"),

  // Processing status
  status: mediaStatusEnum("status").notNull().default("processing"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
