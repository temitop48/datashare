import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken } from "@/lib/server/auth";
import { deleteChallenge, getChallenge } from "@/lib/server/challenges";
import { isLikelyAptosAddress } from "@/lib/wallet";
import { verifyAptosSignature } from "@/lib/server/verifyAptosSignature";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ownerAddress = body?.ownerAddress?.trim();
    const signedAddress = body?.signedAddress?.trim();
    const signedMessage = body?.signedMessage?.trim();
    const publicKey = body?.publicKey?.trim();
    const signature = body?.signature?.trim();

    if (!ownerAddress || !isLikelyAptosAddress(ownerAddress)) {
      return NextResponse.json(
        { error: "Valid ownerAddress is required" },
        { status: 400 }
      );
    }

    if (!signedAddress || !isLikelyAptosAddress(signedAddress)) {
      return NextResponse.json(
        { error: "Valid signedAddress is required" },
        { status: 400 }
      );
    }

    if (!signedMessage || !publicKey || !signature) {
      return NextResponse.json(
        { error: "signedMessage, publicKey, and signature are required" },
        { status: 400 }
      );
    }

    const stored = getChallenge(ownerAddress);

    if (!stored) {
      return NextResponse.json(
        { error: "No challenge found for this wallet" },
        { status: 400 }
      );
    }

    verifyAptosSignature({
      ownerAddress,
      signedAddress,
      expectedMessage: stored.message,
      signedMessage,
      publicKey,
      signature,
    });

    const token = await createSessionToken({
      ownerAddress,
    });

    deleteChallenge(ownerAddress);

    const cookieStore = await cookies();
      cookieStore.set("datashare_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      ownerAddress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 400 }
    );
  }
}