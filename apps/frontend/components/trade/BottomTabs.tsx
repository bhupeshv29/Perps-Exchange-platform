const tabs = [
  "Balances",
  "Positions",
  "Open Orders",
  "Fill History",
  "Order History",
];

export function BottomTabs() {
  return (
    <section className="h-56 shrink-0 rounded-md border border-border bg-surface">
      <div className="flex h-10 items-center gap-1 border-b border-border px-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`rounded px-3 py-1.5 text-xs ${
              index === 1
                ? "bg-surface-secondary text-text-primary"
                : "text-text-muted hover:bg-surface-hover"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 border-b border-border px-4 py-2 text-xs text-text-muted">
        <span>Market</span>
        <span>Side</span>
        <span>Qty</span>
        <span>Entry</span>
        <span>Mark</span>
        <span>PnL</span>
        <span className="text-right">Margin</span>
      </div>

      <div className="grid grid-cols-7 px-4 py-3 font-mono text-xs">
        <span>BTCUSDT</span>
        <span className="text-bid">LONG</span>
        <span>1.00</span>
        <span>100,000</span>
        <span>100,120</span>
        <span className="text-bid">+120.00</span>
        <span className="text-right">1,000</span>
      </div>
    </section>
  );
}
