import { NextRequest, NextResponse } from "next/server";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { db } from "@/lib/db";
import { getShelbyClient } from "@/lib/shelby";
import { getCurrentSession } from "@/lib/server/session";
import { validateDatasetContentUpdate } from "@/lib/validators";
import { createDatasetRevision } from "@/lib/server/revisions";
import { sha256Hex } from "@/lib/checksum";
import { createActivityLog } from "@/lib/server/activity";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    validateDatasetContentUpdate(body);

    const dataset = await db.dataset.findUnique({
      where: { id },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    if (dataset.ownerAddress.toLowerCase() !== session.ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this dataset" },
        { status: 403 }
      );
    }

    const privateKey = process.env.APTOS_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Missing APTOS_PRIVATE_KEY in .env.local");
    }

    const signer = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });

    const prettyJson = JSON.stringify(body.data, null, 2);
    const blobData = Buffer.from(prettyJson);
    const checksum = sha256Hex(prettyJson);

   if (checksum === dataset.checksum) {
     return NextResponse.json(
     { error: "New content matches the current dataset content. No update was made." },
     { status: 400 }
      );
    }
    if (blobData.length > 2_000_000) {
      throw new Error("Dataset too large. Max size is 2MB for now.");
    }

    const timestamp = Date.now();
    const newBlobName = `datasets/${dataset.chain}/${dataset.category}/${dataset.id}/versions/${timestamp}.json`;
    const expirationMicros = (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000;

    const shelbyClient = await getShelbyClient();

    const uploadResult = await shelbyClient.upload({
      signer,
      blobData,
      blobName: newBlobName,
      expirationMicros,
    });

    const updatedDataset = await db.dataset.update({
    where: { id: dataset.id },
    data: {
    blobName: newBlobName,
    fileSizeBytes: blobData.length,
    checksum,
    previewJson: prettyJson.slice(0, 1200),
    ...(typeof body.version === "string"
      ? { version: body.version.trim() }
      : {}),
     },
   });

    const revisionNote =
  typeof body.version === "string"
    ? `Content replaced and version set to ${body.version.trim()}`
    : "Content replaced";

await createDatasetRevision({
  datasetId: updatedDataset.id,
  version: updatedDataset.version,
  blobName: updatedDataset.blobName,
  fileSizeBytes: updatedDataset.fileSizeBytes,
  checksum: updatedDataset.checksum,
  previewJson: updatedDataset.previewJson,
  note: revisionNote,
});

await createActivityLog({
  datasetId: updatedDataset.id,
  action: "REPLACE_CONTENT",
  actorAddress: session.ownerAddress,
  metadata: {
    version: updatedDataset.version,
    checksum: updatedDataset.checksum,
  },
});

    return NextResponse.json({
      success: true,
      dataset: updatedDataset,
      shelby: uploadResult,
    });
  } catch (error: any) {
    console.error("Content update error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}