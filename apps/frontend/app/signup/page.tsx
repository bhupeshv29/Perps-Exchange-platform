export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold text-text-primary">
          Create account
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Start trading on Perps V2.
        </p>

        <div className="mt-6 space-y-4">
          <input
            placeholder="Email"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />

          <button className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover">
            Create account
          </button>
        </div>
      </div>
    </main>
  );
}
