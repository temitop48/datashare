import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/server/session";
import { createDatasetRevision } from "@/lib/server/revisions";
import { createActivityLog } from "@/lib/server/activity";

type RouteContext = {
  params: Promise<{
    id: string;
    revisionId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, revisionId } = await context.params;

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

    const revision = await db.datasetRevision.findFirst({
      where: {
        id: revisionId,
        datasetId: id,
      },
    });

    if (!revision) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    const updatedDataset = await db.dataset.update({
  where: { id: dataset.id },
  data: {
    version: revision.version,
    blobName: revision.blobName,
    fileSizeBytes: revision.fileSizeBytes,
    checksum: revision.checksum,
    previewJson: revision.previewJson,
  },
});

  await createDatasetRevision({
  datasetId: updatedDataset.id,
  version: updatedDataset.version,
  blobName: updatedDataset.blobName,
  fileSizeBytes: updatedDataset.fileSizeBytes,
  checksum: updatedDataset.checksum,
  previewJson: updatedDataset.previewJson,
  note: `Rolled back to revision ${revision.id}`,
  });

  await createActivityLog({
  datasetId: updatedDataset.id,
  action: "ROLLBACK",
  actorAddress: session.ownerAddress,
  metadata: {
    toRevisionId: revision.id,
    version: updatedDataset.version,
    },
  });
  
    return NextResponse.json({
      success: true,
      dataset: updatedDataset,
    });
  } catch (error: any) {
    console.error("Rollback error:", error);

    

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}