import { NextRequest, NextResponse } from "next/server";
import * as teamService from "@/src/services/admin-team";

/**
 * Public endpoint — validates an invite token.
 * No auth required (the invitee hasn't signed up yet).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await teamService.validateInviteToken(token);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid invitation";
    return NextResponse.json({ message }, { status: 404 });
  }
}
