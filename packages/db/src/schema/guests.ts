import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  guestStatusEnum,
  guestMemberStatusEnum,
  ageGroupEnum,
  inviteStatusEnum,
  inviteMethodEnum,
} from "./enums";

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  familyName: text("family_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  language: varchar("language", { length: 5 }).notNull().default("pt-BR"),
  status: guestStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  inviteStatus: inviteStatusEnum("invite_status")
    .notNull()
    .default("not_sent"),
  inviteMethod: inviteMethodEnum("invite_method"),
  inviteSentAt: timestamp("invite_sent_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const guestMembers = pgTable("guest_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id")
    .notNull()
    .references(() => guests.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  ageGroup: ageGroupEnum("age_group").notNull().default("adult"),
  status: guestMemberStatusEnum("status").notNull().default("pending"),
  dietaryNotes: text("dietary_notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const guestsRelations = relations(guests, ({ many }) => ({
  members: many(guestMembers),
}));

export const guestMembersRelations = relations(guestMembers, ({ one }) => ({
  guest: one(guests, {
    fields: [guestMembers.guestId],
    references: [guests.id],
  }),
}));
