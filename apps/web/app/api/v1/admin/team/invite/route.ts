import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { inviteAdminSchema } from "@marriage/shared";
import * as teamService from "@/src/services/admin-team";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const parsed = inviteAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await teamService.inviteAdmin(parsed.data.email, {
      id: session.user.id,
    });

    const inv = result.invitation;
    return NextResponse.json(
      {
        invitation: {
          id: inv.id,
          email: inv.email,
          token: inv.token,
          expiresAt: inv.expiresAt,
        },
        inviteUrl: result.inviteUrl,
        emailSent: result.emailSent,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("already")
          ? 409
          : 500;
    return NextResponse.json({ message }, { status });
  }
}
