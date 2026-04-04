import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { expenseCategoryEnum } from "./enums";
import { user } from "./auth";

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  vendor: text("vendor"),
  budgetCents: integer("budget_cents").notNull(),
  amountCents: integer("amount_cents"), // nullable — filled when paid
  category: expenseCategoryEnum("category").notNull(),
  expenseDate: date("expense_date").notNull(),
  paymentMethod: text("payment_method"),
  paid: boolean("paid").notNull().default(false),
  notes: text("notes"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
