import { api } from "@/lib/api";
import type { DepthResponse, CandlesResponse } from "@/types/api";

export async function getDepth(marketId: string): Promise<DepthResponse> {
  const { data } = await api.get(`/markets/${marketId}/depth`);
  return data;
}

export async function getMarkets() {
  const { data } = await api.get("/markets");
  return data;
}

export async function getCandles(input: {
  marketId: string;
  interval?: "1m" | "5m" | "15m" | "1h" | "1d";
  limit?: number;
}): Promise<CandlesResponse> {
  const { marketId, interval = "1m", limit = 500 } = input;

  const { data } = await api.get(`/markets/${marketId}/candles`, {
    params: {
      interval,
      limit,
    },
  });

  return data;
}
