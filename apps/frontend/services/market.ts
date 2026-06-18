import { api } from "@/lib/api";
import type { DepthResponse } from "@/types/api";

export async function getDepth(marketId: string): Promise<DepthResponse> {
  const { data } = await api.get(`/markets/${marketId}/depth`);
  return data;
}

export async function getMarkets() {
  const { data } = await api.get("/markets");
  return data;
}
