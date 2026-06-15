import { prisma } from "@repo/db";

export async function ensureMarket(marketId: string) {
  await prisma.market.upsert({
    where: {
      id: marketId,
    },
    update: {},
    create: {
      id: marketId,
      symbol: marketId,
    },
  });
}