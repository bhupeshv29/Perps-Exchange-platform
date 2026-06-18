type Props = {
  side: "ASK" | "BID";
  price: number;
  qty: number;
  total: number;
  maxTotal: number;
};

export function DepthRow({ side, price, qty, total, maxTotal }: Props) {
  const percentage = Math.min((total / maxTotal) * 100, 100);

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute inset-y-0 right-0 transition-all duration-300 ${
          side === "ASK" ? "bg-ask/15" : "bg-bid/15"
        }`}
        style={{
          width: `${percentage}%`,
        }}
      />

      <div className="relative z-10 grid grid-cols-3 px-2 py-0.5 font-mono text-xs transition-colors hover:bg-white/5">
        <span className={side === "ASK" ? "text-ask" : "text-bid"}>
          {price.toFixed(2)}
        </span>

        <span className="text-right text-text-secondary">{qty.toFixed(3)}</span>

        <span className="text-right text-text-muted">{total.toFixed(3)}</span>
      </div>
    </div>
  );
}
