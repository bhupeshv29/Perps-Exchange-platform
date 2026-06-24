import { Pool } from "pg";
import { getMarketConfig } from "@repo/common";
const connectionString = process.env.TIMESCALE_DATABASE_URL;

if (!connectionString) {
  throw new Error("TIMESCALE_DATABASE_URL is missing");
}

export const timescale = new Pool({
  connectionString,
  max: 10,
});

type CandleInterval = "1m" | "5m" | "15m" | "1h" | "1d";

const INTERVAL_MAP: Record<CandleInterval, string> = {
  "1m": "1 minute",
  "5m": "5 minutes",
  "15m": "15 minutes",
  "1h": "1 hour",
  "1d": "1 day",
};

export async function getMarketCandles(input: {
  marketId: string;
  interval: "1m" | "5m" | "15m" | "1h" | "1d";
  limit: number;
}) {
  const INTERVAL_MAP = {
    "1m": "1 minute",
    "5m": "5 minutes",
    "15m": "15 minutes",
    "1h": "1 hour",
    "1d": "1 day",
  } as const;

  const interval = INTERVAL_MAP[input.interval];

  const { rows } = await timescale.query(
    `
    WITH bucketed AS (
      SELECT
        time_bucket($2::interval, created_at) AS bucket,
        price,
        qty,
        created_at
      FROM market_trades
      WHERE market_id = $1
    ),
    grouped AS (
      SELECT
        bucket,
        (ARRAY_AGG(price ORDER BY created_at ASC))[1] AS open,
        MAX(price) AS high,
        MIN(price) AS low,
        (ARRAY_AGG(price ORDER BY created_at DESC))[1] AS close,
        SUM(qty) AS volume
      FROM bucketed
      GROUP BY bucket
      ORDER BY bucket DESC
      LIMIT $3
    )
    SELECT *
    FROM grouped
    ORDER BY bucket ASC;
    `,
    [input.marketId, interval, input.limit],
  );
  const market = getMarketConfig(input.marketId);

  if (!market) {
    throw new Error(`Unknown market: ${input.marketId}`);
  }

  return rows.map((row) => ({
    time: Math.floor(new Date(row.bucket).getTime() / 1000),
    open: Number(row.open) / market.priceScale,
    high: Number(row.high) / market.priceScale,
    low: Number(row.low) / market.priceScale,
    close: Number(row.close) / market.priceScale,
    volume: Number(row.volume) / market.qtyScale,
  }));
}
