import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { guestRepository } from "@/src/repositories/guest";
import { inviteService } from "@/src/services/invite";
import { getPublicAppUrl } from "@/lib/public-url";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const sendInviteSchema = z.object({
  method: z.enum(["manual", "sms", "whatsapp", "email"]),
  message: z.string().max(2000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const parsed = sendInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await guestRepository.findById(id);
    if (!existing) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    const result = await inviteService.sendInvite(id, parsed.data.method, parsed.data.message);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error ?? "Failed to send invite" },
        { status: 400 }
      );
    }

    // Refetch guest to get updated invite fields
    const updated = await guestRepository.findById(id);
    const baseUrl = getPublicAppUrl();
    const url = inviteService.getInviteLink(
      { token: existing.token, language: existing.language },
      baseUrl
    );

    return NextResponse.json({
      guest: updated,
      message: result.message,
      url,
      channels: inviteService.getAvailableChannels(),
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
