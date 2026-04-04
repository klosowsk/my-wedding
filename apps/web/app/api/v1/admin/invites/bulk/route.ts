import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { inviteService } from "@/src/services/invite";
import { z } from "zod";

const bulkInviteSchema = z.object({
  guestIds: z.array(z.string().uuid()).min(1),
  method: z.enum(["manual", "sms", "whatsapp", "email"]),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const parsed = bulkInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { guestIds, method } = parsed.data;
    const result = await inviteService.sendBulk(guestIds, method);

    return NextResponse.json({
      message: `Bulk invite complete: ${result.sent} sent, ${result.failed} failed`,
      succeeded: result.sent,
      failed: result.failed,
      total: guestIds.length,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
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
