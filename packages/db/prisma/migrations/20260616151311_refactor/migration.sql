/*
  Warnings:

  - You are about to drop the `Market` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fill" DROP CONSTRAINT "Fill_marketId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_marketId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_marketId_fkey";

-- DropTable
DROP TABLE "Market";
