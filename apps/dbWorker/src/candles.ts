import { timescale } from "./timescale";

export async function getCandles(
  marketId: string,
  interval = "1 minute",
  limit = 500,
) {
  const { rows } = await timescale.query(
    `
    SELECT
      time_bucket($2::interval, created_at) AS bucket,

      first(price, created_at) AS open,
      max(price)               AS high,
      min(price)               AS low,
      last(price, created_at)  AS close,

      SUM(qty)                 AS volume

    FROM market_trades

    WHERE market_id = $1

    GROUP BY bucket

    ORDER BY bucket DESC

    LIMIT $3;
    `,
    [marketId, interval, limit],
  );

  return rows.reverse();
}
