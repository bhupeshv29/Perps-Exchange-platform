"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  BarChart3,
  Bolt,
  CandlestickChart,
  Eye,
  Gauge,
  ShieldCheck,
  Users,
} from "lucide-react";

import { signIn, signUp } from "@/services/auth";
import { queryClient } from "@/lib/queryClient";

type AuthMode = "signin" | "signup";

type FormData = {
  email: string;
  password: string;
};

const features = [
  {
    icon: Gauge,
    title: "Up to 20x Leverage",
    desc: "Amplify your positions with flexible leverage.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Engine",
    desc: "Margin, liquidation, PnL and funding simulation.",
  },
  {
    icon: Bolt,
    title: "Lightning Fast",
    desc: "Realtime matching engine with WebSocket updates.",
  },
  {
    icon: CandlestickChart,
    title: "Real-Time Data",
    desc: "Live orderbook, trades, mark price and positions.",
  },
  {
    icon: BarChart3,
    title: "Advanced Trading",
    desc: "Limit orders, market orders and reduce-only closes.",
  },
];

function AuthPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode: AuthMode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";

  const isSignin = mode === "signin";
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>();

  function switchMode(nextMode: AuthMode) {
    setError("");
    reset();
    router.replace(`${pathname}?mode=${nextMode}`);
  }

  async function onSubmit(data: FormData) {
    try {
      setError("");

      if (isSignin) {
        await signIn(data);
      } else {
        await signUp(data);
        await signIn(data);
      }

      await queryClient.invalidateQueries();

      router.replace("/trade/BTCUSDT");
      router.refresh();
    } catch {
      setError(
        isSignin ? "Invalid email or password" : "Could not create account",
      );
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080b0f] text-text-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-[#0b1015]/95 shadow-2xl backdrop-blur lg:h-[680px] lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="hidden border-r border-border bg-gradient-to-br from-[#222114]/70 via-[#14171d] to-[#0d1218] p-10 lg:block">
            <Link href="/" className="inline-block">
              <h1 className="font-mono text-3xl font-bold sm:text-4xl">
                Leverage<span className="text-[#f7d13c]">X</span>
              </h1>
              <p className="mt-1 text-xs text-[#d9cdb2] sm:text-sm">
                Perpetual Futures Exchange
              </p>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-text-secondary">
              A modern perpetual futures platform with real-time matching
              engine, deep liquidity simulation, and advanced risk management.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-1 lg:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.title} className="flex gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background/70 text-[#f7d13c] sm:h-12 sm:w-12">
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold sm:text-base">
                        {feature.title}
                      </h3>
                      <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-border pt-6 lg:mt-10 lg:pt-8">
              <div className="flex gap-3 sm:gap-4">
                <Users className="shrink-0 text-[#facc15]" size={22} />
                <div>
                  <p className="text-xs text-text-secondary sm:text-sm">
                    Join traders testing a production-style exchange.
                  </p>
                  <p className="mt-2 text-xs text-[#d9cdb2] sm:text-sm">
                    Start your trading journey today.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-[calc(100vh-48px)] items-center justify-center p-6 lg:min-h-0 lg:p-12">
            <div className="w-full max-w-md">
              <h2 className="text-3xl font-bold lg:text-4xl">
                {isSignin ? "Welcome Back" : "Create Account"}
              </h2>

              <p className="mt-3 text-sm text-[#d9cdb2]">
                {isSignin
                  ? "Sign in to access your trading terminal."
                  : "Create an account and start with demo funds."}
              </p>

              <div className="mt-8 grid grid-cols-2 border-b border-border sm:mt-10">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`pb-3 text-base font-semibold transition sm:pb-4 sm:text-lg ${
                    isSignin
                      ? "border-b-2 border-[#f7e7b3] text-[#f7e7b3]"
                      : "text-[#d9cdb2]/70 hover:text-[#f7e7b3]"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`pb-3 text-base font-semibold transition sm:pb-4 sm:text-lg ${
                    !isSignin
                      ? "border-b-2 border-[#f7e7b3] text-[#f7e7b3]"
                      : "text-[#d9cdb2]/70 hover:text-[#f7e7b3]"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
              >
                <label className="block">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[#f7e7b3] sm:text-xs">
                    Username or Email
                  </span>

                  <input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-sm border border-border bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-text-muted focus:border-[#f7d13c] sm:py-4"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-[#f7e7b3] sm:text-xs">
                      Password
                    </span>

                    {isSignin && (
                      <button
                        type="button"
                        className="text-[11px] text-[#f7e7b3] hover:underline sm:text-xs"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="flex items-center rounded-sm border border-border bg-transparent px-4 py-3 focus-within:border-[#f7d13c] sm:py-4">
                    <input
                      {...register("password", {
                        required: true,
                        minLength: 6,
                      })}
                      type="password"
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
                    />

                    <Eye size={18} className="shrink-0 text-text-muted" />
                  </div>
                </label>

                {error && (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                  </p>
                )}

                <button
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#f7d13c] py-3 text-base font-bold text-black transition hover:bg-[#ffe15c] disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-lg"
                >
                  {isSubmitting
                    ? isSignin
                      ? "Signing in..."
                      : "Creating..."
                    : isSignin
                      ? "Sign In"
                      : "Sign Up"}

                  {!isSubmitting && <ArrowRight size={20} />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#d9cdb2] sm:mt-8">
                {isSignin ? "Don't have an account?" : "Already have account?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(isSignin ? "signup" : "signin")}
                  className="font-bold text-[#f7d13c] hover:underline"
                >
                  {isSignin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageContent />
    </Suspense>
  );
}
