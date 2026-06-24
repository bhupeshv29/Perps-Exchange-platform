import type { Fill } from "@repo/common";
import { Pool } from "pg";

const connectionString = process.env.TIMESCALE_DATABASE_URL;

if (!connectionString) {
  throw new Error("TIMESCALE_DATABASE_URL is missing");
}

export const timescale = new Pool({
  connectionString,
  max: 10,
});

export async function initTimescale() {
  await timescale.query(`
    CREATE EXTENSION IF NOT EXISTS timescaledb;
  `);

  await timescale.query(`
    CREATE TABLE IF NOT EXISTS market_trades (
      id TEXT NOT NULL,
      market_id TEXT NOT NULL,
      maker_order_id TEXT NOT NULL,
      taker_order_id TEXT NOT NULL,
      maker_user_id TEXT NOT NULL,
      taker_user_id TEXT NOT NULL,
      price INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);

  await timescale.query(`
    SELECT create_hypertable(
      'market_trades',
      'created_at',
      if_not_exists => TRUE
    );
  `);

  await timescale.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_market_trades_id_time
    ON market_trades (id, created_at);
  `);

  await timescale.query(`
    CREATE INDEX IF NOT EXISTS idx_market_trades_market_time
    ON market_trades (market_id, created_at DESC);
  `);
}

export async function insertMarketTrade(fill: Fill) {
  await timescale.query(
    `
    INSERT INTO market_trades (
      id,
      market_id,
      maker_order_id,
      taker_order_id,
      maker_user_id,
      taker_user_id,
      price,
      qty,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT DO NOTHING;
    `,
    [
      fill.id,
      fill.marketId,
      fill.makerOrderId,
      fill.takerOrderId,
      fill.makerUserId,
      fill.takerUserId,
      fill.price,
      fill.qty,
      new Date(fill.createdAt),
    ],
  );
}
