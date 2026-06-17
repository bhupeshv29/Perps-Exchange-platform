import { api } from "@/lib/api";

type CreateOrderInput = {
  marketId: string;
  side: "BID" | "ASK";
  orderType: "LIMIT" | "MARKET";

  price?: number;
  qty: number;
  margin: number;
  leverage: number;
};

export async function createOrder(input: CreateOrderInput) {
  const response = await api.post("/orders", input);

  return response.data;
}

export async function cancelOrder(orderId: string) {
  const response = await api.delete(`/orders/${orderId}`);

  return response.data;
}

export async function getOrders() {
  const response = await api.get("/orders");

  return response.data;
}
