import Link from "next/link";

const markets = [
  { symbol: "BTCUSDT", price: "63,026.80", change: "+2.14%" },
  { symbol: "ETHUSDT", price: "1,700.72", change: "+1.38%" },
  { symbol: "SOLUSDT", price: "68.97", change: "-0.42%" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen text-text-primary">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex flex-col font-mono text-lg font-bold.">
            <span className="font-mono text-lg font-bold">
              Leverage<span className="text-primary text-2xl">X</span>
            </span>

            <span className="text-[11px] text-text-muted">
              Perpetual Futures Exchange
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/auth?mode=signin"
              className="rounded-md px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Sign in
            </Link>

            <Link
              href="/auth?mode=signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Start Trading
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary">
              Crypto perpetual futures exchange simulator
            </div>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
              Trade perps with a real-time matching engine.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary md:text-lg">
              A modern dark-themed perpetual futures platform with live
              orderbook, market orders, limit orders, leverage, liquidation,
              funding rates, positions, and WebSocket updates.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/trade/BTCUSDT"
                className="rounded-md bg-[#f7d13c] px-6 py-3 text-sm font-bold text-black hover:opacity-90"
              >
                Launch Exchange
              </Link>

              <Link
                href="/auth?mode=signup"
                className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold hover:bg-surface-hover"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <Stat label="Markets" value="3+" />
              <Stat label="Latency" value="Realtime" />
              <Stat label="Leverage" value="20x" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/90 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Live Markets</p>
                <p className="text-xs text-text-muted">Perpetual contracts</p>
              </div>

              <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">
                ● Online
              </span>
            </div>

            <div className="space-y-2">
              {markets.map((market) => (
                <Link
                  key={market.symbol}
                  href={`/trade/${market.symbol}`}
                  className="grid grid-cols-3 rounded-xl border border-border bg-background p-4 font-mono text-sm hover:bg-surface-hover"
                >
                  <span>{market.symbol}</span>
                  <span className="text-right">{market.price}</span>
                  <span
                    className={`text-right ${
                      market.change.startsWith("+") ? "text-bid" : "text-ask"
                    }`}
                  >
                    {market.change}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-text-muted">Orderbook Preview</span>
                <span className="text-primary">BTCUSDT</span>
              </div>

              <DepthRow side="ask" price="63,032.40" qty="0.812" />
              <DepthRow side="ask" price="63,030.10" qty="0.421" />
              <div className="my-2 border-y border-border py-2 text-center font-mono text-sm font-bold">
                63,026.80
              </div>
              <DepthRow side="bid" price="63,025.50" qty="1.204" />
              <DepthRow side="bid" price="63,022.90" qty="0.744" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-14 md:grid-cols-3">
        <Feature
          title="Matching Engine"
          description="Limit and market order matching with maker/taker fills and live depth updates."
        />

        <Feature
          title="Perps Risk Engine"
          description="Margin, leverage, unrealized PnL, liquidation price, and funding rate simulation."
        />

        <Feature
          title="Realtime WebSockets"
          description="Live trades, mark price, balance, orders, and positions pushed instantly to the UI."
        />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="font-mono text-lg font-bold">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 hover:bg-surface-hover">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}

function DepthRow({
  side,
  price,
  qty,
}: {
  side: "bid" | "ask";
  price: string;
  qty: string;
}) {
  return (
    <div className="grid grid-cols-2 py-1 font-mono text-xs">
      <span className={side === "bid" ? "text-bid" : "text-ask"}>{price}</span>
      <span className="text-right text-text-secondary">{qty}</span>
    </div>
  );
}
