import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        toast.error("Please sign in again.");
        break;

      case 403:
        toast.error("You don't have permission.");
        break;

      case 404:
        toast.error("Resource not found.");
        break;

      case 500:
        toast.error("Something went wrong.");
        break;

      default:
        if (!error.response) {
          toast.error("Network error.");
        }
    }

    return Promise.reject(error);
  },
);
