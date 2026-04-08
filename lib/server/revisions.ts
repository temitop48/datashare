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
  title: string;
  description: string;
  chain: string;
  category: string;
  tags: string;
  version: string;
  isPublic: boolean;
  blobName: string;
  fileSizeBytes: number;
  checksum: string;
  previewJson?: string | null;
  note?: string | null;
}) {
  return db.datasetRevision.create({
    data: {
      datasetId: data.datasetId,
      title: data.title,
      description: data.description,
      chain: data.chain,
      category: data.category,
      tags: data.tags,
      version: data.version,
      isPublic: data.isPublic,
      blobName: data.blobName,
      fileSizeBytes: data.fileSizeBytes,
      checksum: data.checksum,
      previewJson: data.previewJson ?? null,
      note: data.note ?? null,
    },
  });
}