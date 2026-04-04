import { NextRequest, NextResponse } from "next/server";
import { guestService } from "@/src/services/guest";
import { rsvpConfirmSchema } from "@marriage/shared/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const guest = await guestService.getByToken(token);

    if (!guest) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(guest);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    // Validate the request body
    const parsed = rsvpConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updatedGuest = await guestService.confirmRSVP(token, parsed.data);

    if (!updatedGuest) {
      return NextResponse.json(
        { message: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGuest);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message === "Guest not found" ? 404 : 500;

    return NextResponse.json({ message }, { status });
  }
}
