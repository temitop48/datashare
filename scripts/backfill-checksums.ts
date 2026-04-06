import { PrismaClient } from "@prisma/client";
import { sha256Hex } from "../lib/checksum";

const prisma = new PrismaClient();

async function main() {
  const datasets = await prisma.dataset.findMany({
    include: {
      revisions: true,
    },
  });

  let datasetUpdates = 0;
  let revisionUpdates = 0;

  for (const dataset of datasets) {
    if (!("checksum" in dataset) || !dataset.checksum) {
      const datasetChecksum = sha256Hex(
        JSON.stringify({
          blobName: dataset.blobName,
          version: dataset.version,
          previewJson: dataset.previewJson ?? "",
          fileSizeBytes: dataset.fileSizeBytes,
        })
      );

      await prisma.dataset.update({
        where: { id: dataset.id },
        data: {
          checksum: datasetChecksum,
        },
      });

      datasetUpdates += 1;
      console.log(`Backfilled dataset checksum for ${dataset.id}`);
    }

    for (const revision of dataset.revisions) {
      if (!("checksum" in revision) || !revision.checksum) {
        const revisionChecksum = sha256Hex(
          JSON.stringify({
            blobName: revision.blobName,
            version: revision.version,
            previewJson: revision.previewJson ?? "",
            fileSizeBytes: revision.fileSizeBytes,
          })
        );

        await prisma.datasetRevision.update({
          where: { id: revision.id },
          data: {
            checksum: revisionChecksum,
          },
        });

        revisionUpdates += 1;
        console.log(`Backfilled revision checksum for ${revision.id}`);
      }
    }
  }

  console.log(`Done. Updated ${datasetUpdates} dataset(s) and ${revisionUpdates} revision(s).`);
}

main()
  .catch((error) => {
    console.error("Checksum backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });