import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import * as teamService from "@/src/services/admin-team";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await teamService.revokeInvitation(id);
    return NextResponse.json({ message: "Invitation revoked" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("not found")
          ? 404
          : 500;
    return NextResponse.json({ message }, { status });
  }
}
