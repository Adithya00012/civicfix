-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "duplicateOfId" TEXT,
ADD COLUMN     "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;
