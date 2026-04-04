import { NextRequest, NextResponse } from "next/server";
import { guestService } from "@/src/services/guest";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  const guest = await guestService.getByToken(token);
  const locale = guest?.language ?? "pt-BR";
  const destination = new URL(`/${locale}/rsvp/${encodeURIComponent(token)}`, request.url);

  return NextResponse.redirect(destination);
}
