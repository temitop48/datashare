import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/server/session";

export async function canCurrentUserAccessDataset(datasetId: string) {
  const dataset = await db.dataset.findUnique({
    where: { id: datasetId },
  });

  if (!dataset) {
    return { allowed: false, reason: "not_found" as const, dataset: null };
  }

  if (dataset.isPublic) {
    return { allowed: true, reason: "public" as const, dataset };
  }

  const session = await getCurrentSession();

  if (
    session?.ownerAddress &&
    session.ownerAddress.toLowerCase() === dataset.ownerAddress.toLowerCase()
  ) {
    return { allowed: true, reason: "owner" as const, dataset };
  }

  return { allowed: false, reason: "forbidden" as const, dataset };
}