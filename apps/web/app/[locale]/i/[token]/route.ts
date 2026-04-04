import { NextRequest, NextResponse } from "next/server";
import { guestService } from "@/src/services/guest";

type RouteContext = { params: Promise<{ locale: string; token: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { locale, token } = await params;

  const guest = await guestService.getByToken(token);
  const targetLocale = guest?.language ?? locale;
  const destination = new URL(
    `/${targetLocale}/rsvp/${encodeURIComponent(token)}`,
    request.url,
  );

  return NextResponse.redirect(destination);
}
