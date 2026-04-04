import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { createExpenseSchema } from "@marriage/shared";
import * as expenseService from "@/src/services/expense";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filters: Record<string, unknown> = {};

    if (searchParams.has("category")) filters.category = searchParams.get("category");
    if (searchParams.has("paid")) filters.paid = searchParams.get("paid") === "true";
    if (searchParams.has("dateFrom")) filters.dateFrom = searchParams.get("dateFrom");
    if (searchParams.has("dateTo")) filters.dateTo = searchParams.get("dateTo");

    const expenses = await expenseService.listExpenses(filters as Parameters<typeof expenseService.listExpenses>[0]);
    return NextResponse.json({ expenses, total: expenses.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const expense = await expenseService.createExpense(
      parsed.data,
      session.user.id
    );
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
