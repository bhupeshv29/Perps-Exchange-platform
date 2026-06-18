import { api } from "@/lib/api";
import type { CreateOrderInput } from "@/schema/order";
import type {
  CancelOrderResponse,
  CreateOrderResponse,
  OrdersResponse,
} from "@/types/api";

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  const { data } = await api.post("/orders", input);
  return data;
}

export async function getOrders(): Promise<OrdersResponse> {
  const { data } = await api.get("/account/orders");
  return data;
}

export async function cancelOrder(input: {
  marketId: string;
  orderId: string;
}): Promise<CancelOrderResponse> {
  const { data } = await api.delete("/orders", {
    data: input,
  });

  return data;
}
