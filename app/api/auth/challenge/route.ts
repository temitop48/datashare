import { NextRequest, NextResponse } from "next/server";
import { createChallenge } from "@/lib/server/challenges";
import { isLikelyAptosAddress } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerAddress = body?.ownerAddress?.trim();

    if (!ownerAddress || !isLikelyAptosAddress(ownerAddress)) {
      return NextResponse.json(
        { error: "Valid ownerAddress is required" },
        { status: 400 }
      );
    }

    const message = createChallenge(ownerAddress);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}