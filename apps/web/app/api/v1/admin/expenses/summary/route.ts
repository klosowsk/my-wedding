import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import * as expenseService from "@/src/services/expense";

export async function GET() {
  try {
    await requireAdmin();
    const summary = await expenseService.getSummary();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
