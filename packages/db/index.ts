import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

// price      -> Int
// qty        -> Int
// margin     -> Int
// balance    -> Int
// pnl        -> Int

// 100.25     => 10025
// 1000 USDT  => 100000 (if scale=100)

// All calculations are integer math.