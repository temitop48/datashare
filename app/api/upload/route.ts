import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getShelbyClient } from "@/lib/shelby";
import { validateDatasetInput } from "@/lib/validators";
import { getCurrentSession } from "@/lib/server/session";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { createDatasetRevision } from "@/lib/server/revisions";
import { sha256Hex } from "@/lib/checksum";
import { createActivityLog } from "@/lib/server/activity";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let tempDatasetId: string | null = null;

  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized. Sign in with your wallet first." },
        { status: 401 }
      );
    }

    const body = await req.json();

    validateDatasetInput(body);

    const {
      title,
      description,
      chain,
      category,
      tags,
      version,
      data,
      isPublic = true,
    } = body;

    const privateKey = process.env.APTOS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Missing APTOS_PRIVATE_KEY in .env.local");
    }

    const signer = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });

    const normalizedChain = chain.trim();
    const normalizedCategory = category.trim();
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedVersion = version.trim();
    const normalizedTags = tags.map((tag: string) => tag.trim()).join(",");

    const prettyJson = JSON.stringify(data, null, 2);
    const blobData = Buffer.from(prettyJson);
    const checksum = sha256Hex(prettyJson);

    if (blobData.length > 2_000_000) {
      throw new Error("Dataset too large. Max size is 2MB for now.");
    }

    const previewJson = prettyJson.slice(0, 1200);

    const tempDataset = await db.dataset.create({
      data: {
        title: normalizedTitle,
        description: normalizedDescription,
        chain: normalizedChain,
        category: normalizedCategory,
        tags: normalizedTags,
        version: normalizedVersion,
        blobName: "pending",
        fileSizeBytes: blobData.length,
        checksum,
        ownerAddress: session.ownerAddress,
        uploadedByAddress: signer.accountAddress.toString(),
        isPublic,
        previewJson,
      },
    });

    tempDatasetId = tempDataset.id;

    const blobName = `datasets/${normalizedChain}/${normalizedCategory}/${tempDataset.id}/data.json`;
    const expirationMicros =
      (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000;

    const shelbyClient = await getShelbyClient();

    const uploadResult = await shelbyClient.upload({
      signer,
      blobData,
      blobName,
      expirationMicros,
    });

    const dataset = await db.dataset.update({
      where: { id: tempDataset.id },
      data: { blobName },
    });

    await createDatasetRevision({
      datasetId: dataset.id,
      title: dataset.title,
      description: dataset.description,
      chain: dataset.chain,
      category: dataset.category,
      tags: dataset.tags,
      version: dataset.version,
      isPublic: dataset.isPublic,
      blobName: dataset.blobName,
      fileSizeBytes: dataset.fileSizeBytes,
      checksum: dataset.checksum,
      previewJson: dataset.previewJson,
      note: "Initial upload",
    });

    await createActivityLog({
      datasetId: dataset.id,
      action: "CREATE",
      actorAddress: session.ownerAddress,
      metadata: {
        version: dataset.version,
        checksum: dataset.checksum,
      },
    });

    return NextResponse.json({
      success: true,
      dataset,
      shelby: uploadResult,
    });
  } catch (error: any) {
    if (tempDatasetId) {
      try {
        await db.dataset.delete({
          where: { id: tempDatasetId },
        });
      } catch (cleanupError) {
        console.error("Failed to clean up pending dataset:", cleanupError);
      }
    }

    console.error("Upload route error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}