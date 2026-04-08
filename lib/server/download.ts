import crypto from "crypto";
import { db } from "@/lib/db";

const COOLDOWN_MS = 10_000;

function hashFingerprint(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function buildDownloadFingerprint(input: {
  datasetId: string;
  ip: string;
  userAgent: string;
}) {
  return hashFingerprint(`${input.datasetId}:${input.ip}:${input.userAgent}`);
}

export async function shouldCountDownload(datasetId: string, fingerprint: string) {
  const cutoff = new Date(Date.now() - COOLDOWN_MS);

  const existing = await db.datasetDownloadEvent.findFirst({
    where: {
      datasetId,
      fingerprint,
      createdAt: {
        gte: cutoff,
      },
    },
  });

  return !existing;
}

export async function recordDownload(datasetId: string, fingerprint: string) {
  await db.$transaction([
    db.dataset.update({
      where: { id: datasetId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    }),
    db.datasetDownloadEvent.create({
      data: {
        datasetId,
        fingerprint,
      },
    }),
  ]);
}