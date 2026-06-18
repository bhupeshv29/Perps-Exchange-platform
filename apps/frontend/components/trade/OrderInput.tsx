"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type Props = {
  label: string;
  suffix?: string;
  type?: "text" | "number";
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
};

export function OrderInput({
  label,
  suffix,
  type = "number",
  placeholder,
  registration,
  error,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-text-muted">{label}</label>

      <div className="flex items-center rounded-md border border-border bg-background focus-within:border-primary">
        <input
          type={type}
          min={type === "number" ? 0 : undefined}
          placeholder={placeholder}
          className="w-full bg-transparent px-2 py-1.5 text-sm outline-none"
          onWheel={(e) => e.currentTarget.blur()}
          onKeyDown={(e) => {
            if (type !== "number") return;
            if (["-", "e", "E"].includes(e.key)) {
              e.preventDefault();
            }
          }}
          {...registration}
        />

        {suffix && (
          <span className="px-2 text-[11px] text-text-muted">{suffix}</span>
        )}
      </div>

      {error && <p className="text-xs text-danger">{error.message}</p>}
    </div>
  );
}
