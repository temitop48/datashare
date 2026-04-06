import { db } from "@/lib/db";

const downloadCooldownMap = new Map<string, number>();

const COOLDOWN_MS = 10_000; // 10 seconds

function getClientKey(ip: string, datasetId: string) {
  return `${ip}:${datasetId}`;
}

export function canIncrementDownload(ip: string, datasetId: string) {
  const key = getClientKey(ip, datasetId);
  const now = Date.now();

  const last = downloadCooldownMap.get(key);

  if (!last || now - last > COOLDOWN_MS) {
    downloadCooldownMap.set(key, now);
    return true;
  }

  return false;
}

export async function incrementDownloadCount(datasetId: string) {
  await db.dataset.update({
    where: { id: datasetId },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
}