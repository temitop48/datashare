import { db } from "@/lib/db";

export async function getDatasetRevisions(datasetId: string) {
  return db.datasetRevision.findMany({
    where: { datasetId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createDatasetRevision(data: {
  datasetId: string;
  version: string;
  blobName: string;
  fileSizeBytes: number;
  checksum: string;
  previewJson?: string | null;
  note?: string | null;
}) {
  return db.datasetRevision.create({
    data: {
      datasetId: data.datasetId,
      version: data.version,
      blobName: data.blobName,
      fileSizeBytes: data.fileSizeBytes,
      checksum: data.checksum,
      previewJson: data.previewJson ?? null,
      note: data.note ?? null,
    },
  });
}