import {
  db,
  expenses,
  guestMembers,
  user,
} from "@marriage/db";
import { eq, and, gte, lte, desc, sql, sum, count } from "drizzle-orm";

interface ListFilters {
  category?: string;
  paid?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * List expenses with optional filters.
 */
export async function listExpenses(filters: ListFilters = {}) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(expenses.category, filters.category as typeof expenses.category.enumValues[number]));
  }
  if (filters.paid !== undefined) {
    conditions.push(eq(expenses.paid, filters.paid));
  }
  if (filters.dateFrom) {
    conditions.push(gte(expenses.expenseDate, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(expenses.expenseDate, filters.dateTo));
  }

  const rows = await db
    .select({
      id: expenses.id,
      title: expenses.title,
      vendor: expenses.vendor,
      budgetCents: expenses.budgetCents,
      amountCents: expenses.amountCents,
      category: expenses.category,
      expenseDate: expenses.expenseDate,
      paymentMethod: expenses.paymentMethod,
      paid: expenses.paid,
      notes: expenses.notes,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      createdById: expenses.createdBy,
      createdByName: user.name,
    })
    .from(expenses)
    .leftJoin(user, eq(expenses.createdBy, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(expenses.expenseDate));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    vendor: r.vendor,
    budgetCents: r.budgetCents,
    amountCents: r.amountCents,
    category: r.category,
    expenseDate: r.expenseDate,
    paymentMethod: r.paymentMethod,
    paid: r.paid,
    notes: r.notes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    createdBy: r.createdById
      ? { id: r.createdById, name: r.createdByName ?? "Unknown" }
      : null,
  }));
}

/**
 * Create a new expense.
 */
export async function createExpense(
  data: {
    title: string;
    vendor?: string | null;
    budgetCents: number;
    amountCents?: number | null;
    category: typeof expenses.category.enumValues[number];
    expenseDate: string;
    paymentMethod?: string | null;
    paid?: boolean;
    notes?: string | null;
  },
  createdBy: string
) {
  const [expense] = await db
    .insert(expenses)
    .values({
      title: data.title,
      vendor: data.vendor ?? null,
      budgetCents: data.budgetCents,
      amountCents: data.amountCents ?? null,
      category: data.category,
      expenseDate: data.expenseDate,
      paymentMethod: data.paymentMethod ?? null,
      paid: data.paid ?? false,
      notes: data.notes ?? null,
      createdBy,
    })
    .returning();
  return expense;
}

/**
 * Update an expense by ID.
 */
export async function updateExpense(
  id: string,
  data: Partial<{
    title: string;
    vendor: string | null;
    budgetCents: number;
    amountCents: number | null;
    category: typeof expenses.category.enumValues[number];
    expenseDate: string;
    paymentMethod: string | null;
    paid: boolean;
    notes: string | null;
  }>
) {
  const [updated] = await db
    .update(expenses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(expenses.id, id))
    .returning();
  return updated;
}

/**
 * Delete an expense by ID.
 */
export async function deleteExpense(id: string) {
  const [deleted] = await db
    .delete(expenses)
    .where(eq(expenses.id, id))
    .returning();
  return deleted;
}

/**
 * Get expense summary: totals by category + cost per guest.
 */
export async function getSummary() {
  const [categoryBreakdown, confirmedGuestCount] = await Promise.all([
    // Aggregate by category
    db
      .select({
        category: expenses.category,
        budgeted: sum(expenses.budgetCents),
        // For paid items, use amountCents if available, else budgetCents
        paid: sql<string>`SUM(CASE WHEN ${expenses.paid} = true THEN COALESCE(${expenses.amountCents}, ${expenses.budgetCents}) ELSE 0 END)`,
      })
      .from(expenses)
      .groupBy(expenses.category),

    // Count confirmed guest members
    db
      .select({ count: count() })
      .from(guestMembers)
      .where(eq(guestMembers.status, "confirmed")),
  ]);

  let totalPaid = 0;
  let totalBudgeted = 0;
  const byCategory = categoryBreakdown.map((row) => {
    const paid = Number(row.paid ?? 0);
    const budgeted = Number(row.budgeted ?? 0);
    totalPaid += paid;
    totalBudgeted += budgeted;
    return {
      category: row.category,
      paid,
      budgeted,
    };
  });

  const confirmedGuests = confirmedGuestCount[0]?.count ?? 0;

  return {
    grandTotal: {
      paid: totalPaid,
      budgeted: totalBudgeted,
      overUnder: totalPaid - totalBudgeted,
    },
    byCategory,
    costPerGuest: {
      confirmedGuests,
      paidCostPerGuest:
        confirmedGuests > 0 ? Math.round(totalPaid / confirmedGuests) : 0,
      budgetedCostPerGuest:
        confirmedGuests > 0
          ? Math.round(totalBudgeted / confirmedGuests)
          : 0,
    },
  };
}
