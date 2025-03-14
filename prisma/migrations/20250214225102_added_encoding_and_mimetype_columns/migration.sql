/*
  Warnings:

  - You are about to drop the column `file_path` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[path]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "File_file_path_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "file_path",
ADD COLUMN     "encoding" TEXT,
ADD COLUMN     "mimetype" TEXT,
ADD COLUMN     "path" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
