import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { guestRepository, guestMemberRepository } from "@/src/repositories/guest";
import { createMemberSchema } from "@marriage/shared/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const guest = await guestRepository.findById(id);
    if (!guest) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    const members = await guestMemberRepository.findByGuestId(id);

    return NextResponse.json(members);
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

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id: guestId } = await params;
    const body = await request.json();

    const parsed = createMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const guest = await guestRepository.findById(guestId);
    if (!guest) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    const member = await guestMemberRepository.create({
      ...parsed.data,
      guestId,
    });

    return NextResponse.json(member, { status: 201 });
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
