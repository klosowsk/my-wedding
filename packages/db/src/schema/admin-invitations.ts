import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { adminInvitationStatusEnum } from "./enums";
import { user } from "./auth";

export const adminInvitations = pgTable("admin_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  invitedBy: text("invited_by").references(() => user.id, {
    onDelete: "set null",
  }),
  status: adminInvitationStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
