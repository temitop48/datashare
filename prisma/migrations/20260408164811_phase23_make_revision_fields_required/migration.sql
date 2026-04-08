/*
  Warnings:

  - Made the column `category` on table `DatasetRevision` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chain` on table `DatasetRevision` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `DatasetRevision` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isPublic` on table `DatasetRevision` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tags` on table `DatasetRevision` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `DatasetRevision` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DatasetRevision" ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "chain" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "isPublic" SET NOT NULL,
ALTER COLUMN "tags" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL;
