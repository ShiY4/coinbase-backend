/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "uid" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("uid");

-- CreateTable
CREATE TABLE "Token" (
    "tokenId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tokenAbbreviation" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "UserToken" (
    "tokenId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "buyPrice" DECIMAL(65,30) NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenAbbreviation_key" ON "Token"("tokenAbbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_memberId_tokenId_key" ON "UserToken"("memberId", "tokenId");

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;
