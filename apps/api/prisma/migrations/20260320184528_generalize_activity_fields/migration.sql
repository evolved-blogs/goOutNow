/*
  Warnings:

  - You are about to drop the column `requiredPlayers` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "requiredPlayers",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "requiredParticipants" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "rolesNeeded" JSONB,
ADD COLUMN     "vibe" TEXT;
