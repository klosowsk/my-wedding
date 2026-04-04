import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  giftStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "./enums";
import { guests } from "./guests";
import { media } from "./media";

export const gifts = pgTable("gifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  namePt: text("name_pt").notNull(),
  nameEn: text("name_en"),
  nameEs: text("name_es"),
  descriptionPt: text("description_pt"),
  descriptionEn: text("description_en"),
  descriptionEs: text("description_es"),
  priceCents: integer("price_cents").notNull(),
  collectedCents: integer("collected_cents").notNull().default(0),
  imageUrl: text("image_url"),
  mediaId: uuid("media_id").references(() => media.id, {
    onDelete: "set null",
  }),
  category: text("category"),
  contributionMode: text("contribution_mode").notNull().default("open"),
  fixedContributionOptions: text("fixed_contribution_options"),
  quoteUnitCents: integer("quote_unit_cents"),
  showCollectedAmount: boolean("show_collected_amount").notNull().default(true),
  showGoalAmount: boolean("show_goal_amount").notNull().default(true),
  showFundedBadge: boolean("show_funded_badge").notNull().default(true),
  status: giftStatusEnum("status").notNull().default("available"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const giftContributions = pgTable("gift_contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  giftId: uuid("gift_id")
    .notNull()
    .references(() => gifts.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id, {
    onDelete: "set null",
  }),
  contributorName: text("contributor_name"),
  amountCents: integer("amount_cents").notNull(),
  quoteQuantity: integer("quote_quantity"),
  quoteUnitCents: integer("quote_unit_cents"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  stripeSessionId: text("stripe_session_id"),
  confirmedBy: uuid("confirmed_by"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const giftsRelations = relations(gifts, ({ one, many }) => ({
  contributions: many(giftContributions),
  media: one(media, {
    fields: [gifts.mediaId],
    references: [media.id],
  }),
}));

export const giftContributionsRelations = relations(
  giftContributions,
  ({ one }) => ({
    gift: one(gifts, {
      fields: [giftContributions.giftId],
      references: [gifts.id],
    }),
    guest: one(guests, {
      fields: [giftContributions.guestId],
      references: [guests.id],
    }),
  })
);
