/*
  Warnings:

  - You are about to drop the `_UserClassrooms` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserClassrooms" DROP CONSTRAINT "_UserClassrooms_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserClassrooms" DROP CONSTRAINT "_UserClassrooms_B_fkey";

-- DropTable
DROP TABLE "_UserClassrooms";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
