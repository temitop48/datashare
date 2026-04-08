-- AlterTable
ALTER TABLE "DatasetRevision" ADD COLUMN     "category" TEXT,
ADD COLUMN     "chain" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPublic" BOOLEAN,
ADD COLUMN     "tags" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "DatasetDownloadEvent" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasetDownloadEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DatasetDownloadEvent" ADD CONSTRAINT "DatasetDownloadEvent_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
