type Props = {
  side: "ASK" | "BID";
  price: number;
  qty: number;
  maxQty: number;
};
export function DepthRow({ side, price, qty, maxQty }: Props) {
  const percentage = (qty / maxQty) * 100;

  return (
    <div className="relative">
      <div
        className={`absolute right-0 top-0 bottom-0 opacity-20 ${
          side === "ASK" ? "bg-ask" : "bg-bid"
        }`}
        style={{
          width: `${percentage}%`,
        }}
      />

      <div className="relative z-10 grid grid-cols-3 px-2 py-0.5 text-xs font-mono hover:bg-surface-hover">
        <span className={side === "ASK" ? "text-ask" : "text-bid"}>
          {price.toFixed(2)}
        </span>

        <span className="text-right">{qty.toFixed(3)}</span>

        <span className="text-right text-text-muted">
          {(price * qty).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
