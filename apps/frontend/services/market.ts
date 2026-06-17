import { api } from "@/lib/api";

export async function getDepth(marketId: string) {
  const response = await api.get(`/depth/${marketId}`);
  return response.data;
}

export async function getMarkets() {
  const response = await api.get("/markets");
  return response.data;
}
