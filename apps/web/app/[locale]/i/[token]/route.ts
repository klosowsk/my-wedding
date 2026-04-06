import { NextRequest, NextResponse } from "next/server";
import { getPublicAppUrl } from "@/lib/public-url";
import { guestService } from "@/src/services/guest";

type RouteContext = { params: Promise<{ locale: string; token: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { locale, token } = await params;

  const guest = await guestService.getByToken(token);
  const targetLocale = guest?.language ?? locale;
  const baseUrl = getPublicAppUrl();
  const destination = `${baseUrl}/${targetLocale}/rsvp/${encodeURIComponent(token)}`;

  return NextResponse.redirect(destination);
}
