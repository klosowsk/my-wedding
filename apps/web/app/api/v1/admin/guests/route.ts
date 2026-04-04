import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { guestRepository, guestMemberRepository } from "@/src/repositories/guest";
import { generateGuestToken } from "@/src/services/guest-token";
import { createGuestSchema, createMemberSchema } from "@marriage/shared/validators";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const guests = await guestRepository.findAll({ search, status });

    return NextResponse.json(guests);
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

const createGuestWithMembersSchema = createGuestSchema.extend({
  members: z.array(createMemberSchema).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createGuestWithMembersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { members, ...guestData } = parsed.data;
    const token = await generateGuestToken(guestData.familyName);

    const guest = await guestRepository.create({ ...guestData, token });
    if (!guest) {
      return NextResponse.json({ message: "Failed to create guest" }, { status: 500 });
    }

    const createdMembers = await Promise.all(
      (members ?? []).map((member) =>
        guestMemberRepository.create({ ...member, guestId: guest.id })
      )
    );

    return NextResponse.json(
      { ...guest, members: createdMembers },
      { status: 201 }
    );
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
