import { NextRequest, NextResponse } from "next/server";
import { siteConfigService } from "@/src/services/site-config";

export async function GET(_request: NextRequest) {
  try {
    const config = await siteConfigService.getPublicConfig();

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
