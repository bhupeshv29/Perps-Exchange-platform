"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "@/services/auth";

type FormData = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    try {
      setError("");
      await signIn(data);
      router.push("/trade/BTCUSDT");
    } catch {
      setError("Invalid email or password");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <h1 className="text-xl font-semibold">Sign in</h1>

        <p className="mt-2 text-sm text-text-secondary">
          Login to your trading account.
        </p>

        <div className="mt-6 space-y-4">
          <input
            {...register("email", { required: true })}
            placeholder="Email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
          />

          <input
            {...register("password", { required: true })}
            placeholder="Password"
            type="password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-text-muted">
            No account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
