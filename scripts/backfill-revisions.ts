import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const datasets = await prisma.dataset.findMany({
    include: {
      revisions: true,
    },
  });

  let created = 0;

  for (const dataset of datasets) {
    if (dataset.revisions.length > 0) {
      continue;
    }

    await prisma.datasetRevision.create({
      data: {
        datasetId: dataset.id,
        version: dataset.version,
        blobName: dataset.blobName,
        fileSizeBytes: dataset.fileSizeBytes,
        checksum: dataset.checksum,
        previewJson: dataset.previewJson,
        note: "Initial backfill revision",
      },
    });

    created += 1;
    console.log(`Created backfill revision for dataset ${dataset.id}`);
  }

  console.log(`Done. Created ${created} revision(s).`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });