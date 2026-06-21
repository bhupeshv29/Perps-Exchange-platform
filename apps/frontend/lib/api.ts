import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.backendToken) {
    config.headers.Authorization = `Bearer ${session.backendToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error("Please sign in again.");
      await signOut({ redirectTo: "/auth?mode=signin" });
    } else if (status === 403) toast.error("You don't have permission.");
    else if (status === 404) toast.error("Resource not found.");
    else if (status === 500) toast.error("Something went wrong.");
    else if (!error.response) toast.error("Network error.");

    return Promise.reject(error);
  },
);
