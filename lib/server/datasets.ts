import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/server/session";

export async function getAllDatasets() {
  return db.dataset.findMany({
    where: {
      isPublic: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDatasetById(id: string) {
  const dataset = await db.dataset.findUnique({
    where: { id },
  });

  if (!dataset) {
    return null;
  }

  if (dataset.isPublic) {
    return dataset;
  }

  const session = await getCurrentSession();

  if (
    session?.ownerAddress &&
    session.ownerAddress.toLowerCase() === dataset.ownerAddress.toLowerCase()
  ) {
    return dataset;
  }

  return null;
}

export async function searchDatasets(query: string) {
  return db.dataset.findMany({
    where: {
      isPublic: true,
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
        { chain: { contains: query } },
        { category: { contains: query } },
        { tags: { contains: query } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}