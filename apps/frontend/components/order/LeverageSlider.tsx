"use client";

type Props = {
  value: number;
  max: number;
  onChange(value: number): void;
};

export function LeverageSlider({ value, max, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-xs text-text-muted">Leverage</label>

        <span className="text-sm font-semibold">{value}x</span>
      </div>

      <input
        type="range"
        min={1}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />

      <div className="flex justify-between text-[10px] text-text-muted">
        <span>1x</span>
        <span>{max}x</span>
      </div>
    </div>
  );
}
