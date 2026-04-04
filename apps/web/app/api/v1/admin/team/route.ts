import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import * as teamService from "@/src/services/admin-team";

export async function GET() {
  try {
    await requireAdmin();
    const team = await teamService.getTeam();
    return NextResponse.json(team);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
