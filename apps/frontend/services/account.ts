import { api } from "@/lib/api";

export async function getBalance() {
  const { data } = await api.get("/account/balance");
  return data;
}

export async function getPositions() {
  const { data } = await api.get("/account/positions");
  return data;
}

export async function getFills() {
  const { data } = await api.get("/account/fills");
  return data;
}

export async function deposit(amount: number) {
  const { data } = await api.post("/account/on-ramp", {
    amount,
  });

  return data;
}
