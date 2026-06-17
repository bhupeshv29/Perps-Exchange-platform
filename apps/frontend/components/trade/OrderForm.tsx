type Props = {
  marketId: string;
};

export function OrderForm({ marketId }: Props) {
  return (
    <aside className="min-h-0 rounded-md border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Place order</h2>
        <p className="mt-1 text-xs text-text-muted">{marketId}</p>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-md bg-bid/15 py-2 text-sm font-medium text-bid">
            Buy / Long
          </button>

          <button className="rounded-md bg-surface-secondary py-2 text-sm font-medium text-text-secondary">
            Sell / Short
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-md bg-surface-secondary py-2 text-xs text-text-primary">
            Limit
          </button>

          <button className="rounded-md py-2 text-xs text-text-muted hover:bg-surface-hover">
            Market
          </button>
        </div>

        <Field label="Price" value="100000" suffix="USDT" />
        <Field label="Quantity" value="1" suffix="BTC" />
        <Field label="Margin" value="1000" suffix="USDT" />
        <Field label="Leverage" value="10" suffix="x" />

        <div className="space-y-2 rounded-md bg-background p-3 text-xs">
          <Row label="Available" value="10,000 USDT" />
          <Row label="Order value" value="100,000 USDT" />
          <Row label="Est. liquidation" value="90,000 USDT" />
        </div>

        <button className="w-full rounded-md bg-bid py-3 text-sm font-semibold text-black hover:opacity-90">
          Buy BTCUSDT
        </button>
      </div>
    </aside>
  );
}

function Field({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-text-muted">{label}</span>

      <div className="flex items-center rounded-md border border-border bg-background">
        <input
          defaultValue={value}
          className="w-full bg-transparent px-3 py-2 font-mono text-sm text-text-primary"
        />

        <span className="pr-3 text-xs text-text-muted">{suffix}</span>
      </div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono text-text-secondary">{value}</span>
    </div>
  );
}
