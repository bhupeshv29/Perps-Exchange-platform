/*
  Warnings:

  - You are about to alter the column `available` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `locked` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `qty` on the `ClosedPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `entryPrice` on the `ClosedPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `exitPrice` on the `ClosedPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `margin` on the `ClosedPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `leverage` on the `ClosedPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `realizedPnl` on the `ClosedPosition` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price` on the `Fill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `qty` on the `Fill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `qty` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `filledQty` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `margin` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `leverage` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `qty` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `entryPrice` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `margin` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `leverage` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `realizedPnl` on the `Position` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Balance" ALTER COLUMN "available" SET DEFAULT 0,
ALTER COLUMN "available" SET DATA TYPE INTEGER,
ALTER COLUMN "locked" SET DEFAULT 0,
ALTER COLUMN "locked" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "ClosedPosition" ALTER COLUMN "qty" SET DATA TYPE INTEGER,
ALTER COLUMN "entryPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "exitPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "margin" SET DATA TYPE INTEGER,
ALTER COLUMN "leverage" SET DATA TYPE INTEGER,
ALTER COLUMN "realizedPnl" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Fill" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "qty" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "qty" SET DATA TYPE INTEGER,
ALTER COLUMN "filledQty" SET DEFAULT 0,
ALTER COLUMN "filledQty" SET DATA TYPE INTEGER,
ALTER COLUMN "margin" SET DATA TYPE INTEGER,
ALTER COLUMN "leverage" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Position" ALTER COLUMN "qty" SET DATA TYPE INTEGER,
ALTER COLUMN "entryPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "margin" SET DATA TYPE INTEGER,
ALTER COLUMN "leverage" SET DATA TYPE INTEGER,
ALTER COLUMN "realizedPnl" SET DEFAULT 0,
ALTER COLUMN "realizedPnl" SET DATA TYPE INTEGER;
