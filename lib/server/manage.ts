import { db } from "@/lib/db";

export async function getAllDatasetsForManage() {
  return db.dataset.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDatasetsByOwner(
  ownerAddress: string,
  visibility?: "all" | "public" | "private"
) {
  return db.dataset.findMany({
    where: {
      ownerAddress,
      ...(visibility === "public" ? { isPublic: true } : {}),
      ...(visibility === "private" ? { isPublic: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOwnerDatasetStats(ownerAddress: string) {
  const datasets = await db.dataset.findMany({
    where: {
      ownerAddress,
    },
    select: {
      id: true,
      isPublic: true,
      downloadCount: true,
    },
  });

  const totalDatasets = datasets.length;
  const publicDatasets = datasets.filter((d) => d.isPublic).length;
  const privateDatasets = datasets.filter((d) => !d.isPublic).length;
  const totalDownloads = datasets.reduce(
    (sum, dataset) => sum + dataset.downloadCount,
    0
  );

  return {
    totalDatasets,
    publicDatasets,
    privateDatasets,
    totalDownloads,
  };
}