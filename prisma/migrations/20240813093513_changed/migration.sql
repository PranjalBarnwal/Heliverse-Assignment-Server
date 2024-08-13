/*
  Warnings:

  - Changed the type of `startTime` on the `Lecture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `Lecture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Lecture" DROP COLUMN "startTime";
ALTER TABLE "Lecture" ADD COLUMN     "startTime" STRING NOT NULL;
ALTER TABLE "Lecture" DROP COLUMN "endTime";
ALTER TABLE "Lecture" ADD COLUMN     "endTime" STRING NOT NULL;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "startTime";
ALTER TABLE "Schedule" ADD COLUMN     "startTime" STRING NOT NULL;
ALTER TABLE "Schedule" DROP COLUMN "endTime";
ALTER TABLE "Schedule" ADD COLUMN     "endTime" STRING NOT NULL;
