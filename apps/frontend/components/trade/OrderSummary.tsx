"use client";

type Props = {
  available: number;
  margin: number;
  leverage: number;
};

export function OrderSummary({ available, margin, leverage }: Props) {
  const positionValue = margin * leverage;

  return (
    <div className="space-y-2 rounded-md border border-border bg-background p-3">
      <SummaryRow label="Available" value={`${available.toFixed(2)} USDT`} />
      <SummaryRow label="Margin" value={`${margin.toFixed(2)} USDT`} />
      <SummaryRow label="Leverage" value={`${leverage}x`} />
      <SummaryRow
        label="Position Value"
        value={`${positionValue.toFixed(2)} USDT`}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono text-text-primary">{value}</span>
    </div>
  );
}
