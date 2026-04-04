import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { inviteService } from "@/src/services/invite";

export async function GET() {
  try {
    await requireAdmin();

    const channels = inviteService.getAvailableChannels();

    return NextResponse.json({ channels });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : 500;
    return NextResponse.json({ message }, { status });
  }
}
