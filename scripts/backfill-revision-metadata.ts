import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const revisions = await prisma.datasetRevision.findMany({
    include: {
      dataset: true,
    },
  });

  let updated = 0;

  for (const revision of revisions) {
    const needsBackfill =
      !revision.title ||
      !revision.description ||
      !revision.chain ||
      !revision.category ||
      !revision.tags;

    if (!needsBackfill) {
      continue;
    }

    await prisma.datasetRevision.update({
      where: { id: revision.id },
      data: {
        title: revision.dataset.title,
        description: revision.dataset.description,
        chain: revision.dataset.chain,
        category: revision.dataset.category,
        tags: revision.dataset.tags,
        version: revision.version || revision.dataset.version,
        isPublic: revision.dataset.isPublic,
      },
    });

    updated += 1;
    console.log(`Backfilled revision metadata: ${revision.id}`);
  }

  console.log(`Done. Updated ${updated} revision(s).`);
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });