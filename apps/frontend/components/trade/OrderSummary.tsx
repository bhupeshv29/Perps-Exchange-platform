"use client";

type Props = {
  available: number;
  price?: number;
  qty: number;
  leverage: number;
  orderType: "LIMIT" | "MARKET";
  markPrice: number;
};

export function OrderSummary({
  available,
  price,
  qty,
  leverage,
  orderType,
  markPrice,
}: Props) {
  const estimatedPrice = orderType === "LIMIT" ? price || 0 : markPrice || 0;

  const positionValue = estimatedPrice * qty;
  const requiredMargin = leverage > 0 ? positionValue / leverage : 0;
  const maintenanceMargin = requiredMargin * 0.1;

  return (
    <div className="space-y-1 rounded-md border border-border bg-background p-2">
      <SummaryRow label="Available" value={`${available.toFixed(2)} USDT`} />

      <SummaryRow
        label="Position Value"
        value={`${positionValue.toFixed(2)} USDT`}
      />
      <SummaryRow
        label="Required Margin"
        value={`${requiredMargin.toFixed(2)} USDT`}
      />
      <SummaryRow
        label="Maintenance Margin"
        value={`${maintenanceMargin.toFixed(2)} USDT`}
      />
      <SummaryRow label="Leverage" value={`${leverage}x`} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono text-text-primary">{value}</span>
    </div>
  );
}
