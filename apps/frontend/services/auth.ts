import { api } from "@/lib/api";

type SignInInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  email: string;
  password: string;
};

export async function signIn(data: SignInInput) {
  const response = await api.post("auth/signin", data);
  return response.data;
}

export async function signUp(data: SignUpInput) {
  const response = await api.post("auth/signup", data);
  return response.data;
}

export async function signOut(data: SignInInput) {
  const response = await api.post("auth/logout");
  return response.data;
}

export async function getMe(data: SignInInput) {
  const response = await api.post("auth/me");
  return response.data;
}
