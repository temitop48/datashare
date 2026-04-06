import { db } from "@/lib/db";

export type ActivityAction =
  | "CREATE"
  | "UPDATE_METADATA"
  | "REPLACE_CONTENT"
  | "DELETE"
  | "ROLLBACK";

export async function createActivityLog(data: {
  datasetId: string;
  action: ActivityAction;
  actorAddress: string;
  metadata?: Record<string, any>;
}) {
  return db.datasetActivity.create({
    data: {
      datasetId: data.datasetId,
      action: data.action,
      actorAddress: data.actorAddress,
      metadata: data.metadata
        ? JSON.stringify(data.metadata)
        : null,
    },
  });
}

export async function getDatasetActivities(datasetId: string) {
  return db.datasetActivity.findMany({
    where: { datasetId },
    orderBy: {
      createdAt: "desc",
    },
  });
}