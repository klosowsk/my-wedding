import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import * as expenseService from "@/src/services/expense";
import { EXPENSE_CATEGORIES } from "@marriage/shared";

export async function GET() {
  try {
    await requireAdmin();
    const expenses = await expenseService.listExpenses();

    const headers = [
      "Date",
      "Category",
      "Title",
      "Vendor",
      "Budget",
      "Actual",
      "Payment Method",
      "Status",
      "Notes",
    ];

    const rows = expenses.map((e) => {
      const cat =
        EXPENSE_CATEGORIES[e.category as keyof typeof EXPENSE_CATEGORIES];
      return [
        e.expenseDate,
        cat?.en ?? e.category,
        e.title,
        e.vendor ?? "",
        (e.budgetCents / 100).toFixed(2),
        e.amountCents != null ? (e.amountCents / 100).toFixed(2) : "",
        e.paymentMethod ?? "",
        e.paid ? "Paid" : "Planned",
        e.notes ?? "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wedding-expenses-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
