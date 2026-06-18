import { api } from "@/lib/api";
import type {
  BalanceResponse,
  DepositResponse,
  FillsResponse,
  PositionsResponse,
} from "@/types/api";

export async function getBalance(): Promise<BalanceResponse> {
  const { data } = await api.get("/account/balance");
  return data;
}

export async function getPositions(): Promise<PositionsResponse> {
  const { data } = await api.get("/account/positions");
  return data;
}

export async function getFills(): Promise<FillsResponse> {
  const { data } = await api.get("/account/fills");
  return data;
}

export async function getClosedPositions() {
  const { data } = await api.get("/account/closed-positions");

  return data;
}

export async function getOrderHistory() {
  const { data } = await api.get("/account/orders");
  return data;
}

export async function deposit(amount: number): Promise<DepositResponse> {
  const { data } = await api.post("/account/on-ramp", {
    amount,
  });

  return data;
}
