import { api } from "@/lib/api";
import { CreateOrderInput } from "@/schema/order";

export async function createOrder(input: CreateOrderInput) {
  const { data } = await api.post("/orders", input);
  return data;
}

export async function getOrders() {
  const { data } = await api.get("/account/orders");
  return data;
}

export async function cancelOrder(input: {
  marketId: string;
  orderId: string;
}) {
  const { data } = await api.delete("/orders", {
    data: input,
  });

  return data;
}
