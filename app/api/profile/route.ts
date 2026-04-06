import { NextRequest, NextResponse } from "next/server";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { db } from "@/lib/db";
import { getShelbyClient } from "@/lib/shelby";
import { getCurrentSession } from "@/lib/server/session";
import { sha256Hex } from "@/lib/checksum";
import { validateUserProfileInput } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await db.userProfile.findUnique({
      where: {
        ownerAddress: session.ownerAddress,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    validateUserProfileInput(body);

    const privateKey = process.env.APTOS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Missing APTOS_PRIVATE_KEY in .env.local");
    }

    const signer = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });

    const publicProfile = {
      ownerAddress: session.ownerAddress,
      displayName: body.displayName.trim(),
      bio: typeof body.bio === "string" ? body.bio.trim() : "",
      avatarUrl: typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "",
      website: typeof body.website === "string" ? body.website.trim() : "",
      twitterHandle: typeof body.twitterHandle === "string" ? body.twitterHandle.trim() : "",
      discordHandle: typeof body.discordHandle === "string" ? body.discordHandle.trim() : "",
      contactEmail: typeof body.contactEmail === "string" ? body.contactEmail.trim() : "",
      skills: Array.isArray(body.skills)
        ? body.skills.map((skill: string) => skill.trim()).filter(Boolean)
        : [],
    };

    const prettyJson = JSON.stringify(publicProfile, null, 2);
    const blobData = Buffer.from(prettyJson);
    const checksum = sha256Hex(prettyJson);

    if (blobData.length > 1_000_000) {
      throw new Error("Profile too large. Max size is 1MB.");
    }

    const timestamp = Date.now();
    const blobName = `profiles/${session.ownerAddress}/profile-${timestamp}.json`;
    const expirationMicros = (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000;

    const shelbyClient = await getShelbyClient();

    await shelbyClient.upload({
      signer,
      blobData,
      blobName,
      expirationMicros,
    });

    const existing = await db.userProfile.findUnique({
      where: { ownerAddress: session.ownerAddress },
    });

    const data = {
      ownerAddress: session.ownerAddress,
      displayName: publicProfile.displayName,
      bio: publicProfile.bio || null,
      avatarUrl: publicProfile.avatarUrl || null,
      website: publicProfile.website || null,
      twitterHandle: publicProfile.twitterHandle || null,
      discordHandle: publicProfile.discordHandle || null,
      contactEmail: publicProfile.contactEmail || null,
      skills: publicProfile.skills.length ? publicProfile.skills.join(",") : null,
      blobName,
      fileSizeBytes: blobData.length,
      checksum,
      previewJson: prettyJson.slice(0, 1200),
    };

    const profile = existing
      ? await db.userProfile.update({
          where: { ownerAddress: session.ownerAddress },
          data,
        })
      : await db.userProfile.create({
          data,
        });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("Save profile error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}