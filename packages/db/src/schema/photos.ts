import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { media } from "./media";

export const photos = pgTable("photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  mediaId: uuid("media_id").references(() => media.id, {
    onDelete: "set null",
  }),
  captionPt: text("caption_pt"),
  captionEn: text("caption_en"),
  captionEs: text("caption_es"),
  section: text("section"),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const photosRelations = relations(photos, ({ one }) => ({
  media: one(media, {
    fields: [photos.mediaId],
    references: [media.id],
  }),
}));
