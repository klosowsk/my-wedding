import * as repo from "@/src/repositories/expense";

interface ListFilters {
  category?: string;
  paid?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export async function listExpenses(filters: ListFilters = {}) {
  return repo.listExpenses(filters);
}

export async function createExpense(
  data: {
    title: string;
    vendor?: string | null;
    budgetCents: number;
    amountCents?: number | null;
    category: string;
    expenseDate: string;
    paymentMethod?: string | null;
    paid?: boolean;
    notes?: string | null;
  },
  userId: string
) {
  return repo.createExpense(data as Parameters<typeof repo.createExpense>[0], userId);
}

export async function updateExpense(
  id: string,
  data: Partial<{
    title: string;
    vendor: string | null;
    budgetCents: number;
    amountCents: number | null;
    category: string;
    expenseDate: string;
    paymentMethod: string | null;
    paid: boolean;
    notes: string | null;
  }>
) {
  const updated = await repo.updateExpense(id, data as Parameters<typeof repo.updateExpense>[1]);
  if (!updated) throw new Error("Expense not found.");
  return updated;
}

export async function deleteExpense(id: string) {
  const deleted = await repo.deleteExpense(id);
  if (!deleted) throw new Error("Expense not found.");
  return deleted;
}

export async function getSummary() {
  return repo.getSummary();
}
