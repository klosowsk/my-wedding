import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import * as teamService from "@/src/services/admin-team";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    await teamService.removeAdmin(id, {
      id: session.user.id,
      email: session.user.email,
    });
    return NextResponse.json({ message: "Admin removed" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden" || message.includes("superadmin")
          ? 403
          : message.includes("not found")
            ? 404
            : message.includes("yourself")
              ? 400
              : 500;
    return NextResponse.json({ message }, { status });
  }
}
