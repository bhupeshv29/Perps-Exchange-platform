const asks = [
  [100120, 0.42],
  [100110, 0.31],
  [100100, 1.2],
  [100090, 0.8],
  [100080, 0.15],
];

const bids = [
  [100070, 0.5],
  [100060, 1.1],
  [100050, 0.34],
  [100040, 0.76],
  [100030, 0.2],
];

export function DepthPanel() {
  return (
    <section className="min-h-0 rounded-md border border-border bg-surface">
      <div className="flex h-10 items-center justify-between border-b border-border px-3">
        <div className="flex gap-2">
          <button className="rounded bg-surface-secondary px-2 py-1 text-xs">
            Book
          </button>
          <button className="rounded px-2 py-1 text-xs text-text-muted">
            Trades
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border px-3 py-2 text-xs text-text-muted">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      <div className="flex h-[calc(100%-76px)] flex-col px-3 py-2 font-mono text-xs">
        <div className="flex-1 space-y-1">
          {asks.map(([price, qty]) => (
            <div key={price} className="grid grid-cols-3 text-ask">
              <span>{price.toLocaleString()}</span>
              <span className="text-right text-text-secondary">{qty}</span>
              <span className="text-right text-text-muted">{qty}</span>
            </div>
          ))}
        </div>

        <div className="my-3 border-y border-border py-2 text-center">
          <p className="font-mono text-sm text-bid">100,075.00</p>
          <p className="text-[10px] text-text-muted">Last traded price</p>
        </div>

        <div className="flex-1 space-y-1">
          {bids.map(([price, qty]) => (
            <div key={price} className="grid grid-cols-3 text-bid">
              <span>{price.toLocaleString()}</span>
              <span className="text-right text-text-secondary">{qty}</span>
              <span className="text-right text-text-muted">{qty}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
