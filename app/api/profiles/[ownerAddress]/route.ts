import { NextRequest, NextResponse } from "next/server";
import { getProfileByOwnerAddress } from "@/lib/server/profiles";

type RouteContext = {
  params: Promise<{
    ownerAddress: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { ownerAddress } = await context.params;

    const profile = await getProfileByOwnerAddress(ownerAddress);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}