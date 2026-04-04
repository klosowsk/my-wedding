import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/auth/session";
import { guestRepository } from "@/src/repositories/guest";
import { updateGuestSchema } from "@marriage/shared/validators";

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

    return NextResponse.json(guest);
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

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const parsed = updateGuestSchema.safeParse(body);
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

    const updated = await guestRepository.update(id, parsed.data);

    return NextResponse.json(updated);
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

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await guestRepository.findById(id);
    if (!existing) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    await guestRepository.remove(id);

    return NextResponse.json({ message: "Guest deleted" });
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
