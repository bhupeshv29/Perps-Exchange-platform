import { api } from "@/lib/api";

export async function getBalance() {
  const response = await api.get("/balance");
  return response.data;
}

export async function getPosition() {
  const response = await api.get("/position");
  return response.data;
}

export async function deposit(amount: number) {
  const response = await api.post("/onramp", {
    amount,
  });
  return response.data;
}
