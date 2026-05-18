import { NextRequest, NextResponse } from "next/server";
import { guestService } from "@/src/services/guest";
import { siteConfigService } from "@/src/services/site-config";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;

  const wedding = await siteConfigService.getWeddingConfig();

  if (wedding.features.rsvpExternalUrl) {
    return NextResponse.redirect(wedding.features.rsvpExternalUrl);
  }

  const guest = await guestService.getByToken(token);
  const locale = guest?.language ?? "pt-BR";
  const destination = new URL(`/${locale}/rsvp/${encodeURIComponent(token)}`, request.url);

  return NextResponse.redirect(destination);
}
