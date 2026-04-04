import { NextRequest, NextResponse } from "next/server";
import { giftService } from "@/src/services/gift";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const locale = searchParams.get("locale") ?? "pt-BR";

    const gifts = await giftService.listPublic(locale);

    return NextResponse.json(gifts);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
