"use client";

type Props = {
  value: number;
  max: number;
  onChange(value: number): void;
};

export function LeverageSlider({ value, max, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs text-text-muted">Leverage</label>

        <span
          className={`
      rounded px-2 py-1 text-xs font-bold
      ${
        value <= 5
          ? "bg-success/20 text-success"
          : value <= 10
            ? "bg-warning/20 text-warning"
            : "bg-danger/20 text-danger"
      }
    `}
        >
          {value}x
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
      w-full
      h-1.5
      appearance-none
      bg-[#2b3648]
      rounded-full
      accent-[#1a7bca]
  "
      />

      <div className="flex justify-between text-[10px] text-text-muted">
        <span>1x</span>
        <span>{max}x</span>
      </div>
    </div>
  );
}
