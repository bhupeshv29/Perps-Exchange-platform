"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signUp } from "@/services/auth";

type FormData = {
  email: string;
  password: string;
};

export default function SignUpPage() {
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
      await signUp(data);
      router.push("/trade/BTCUSDT");
    } catch {
      setError("Could not create account");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <h1 className="text-xl font-semibold">Create account</h1>

        <p className="mt-2 text-sm text-text-secondary">
          Start trading on Perps V2.
        </p>

        <div className="mt-6 space-y-4">
          <input
            {...register("email", { required: true })}
            placeholder="Email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
          />

          <input
            {...register("password", {
              required: true,
              minLength: 6,
            })}
            placeholder="Password"
            type="password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
