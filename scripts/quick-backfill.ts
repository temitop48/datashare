import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const datasets = await prisma.dataset.findMany();

  const rowsToBackfill = datasets.filter(
    (dataset) => !dataset.uploadedByAddress
  );

  console.log(`Found ${rowsToBackfill.length} dataset(s) to backfill.`);

  for (const dataset of rowsToBackfill) {
    await prisma.dataset.update({
      where: { id: dataset.id },
      data: {
        uploadedByAddress: dataset.ownerAddress,
      },
    });

    console.log(`Backfilled dataset ${dataset.id}`);
  }

  console.log("Backfill complete.");
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });