import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
