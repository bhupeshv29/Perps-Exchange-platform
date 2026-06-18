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
      <label className="text-xs text-text-muted">{label}</label>

      <div className="flex items-center rounded-md border border-border bg-background focus-within:border-primary">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none"
          {...registration}
        />

        {suffix && (
          <span className="px-3 text-xs text-text-muted">{suffix}</span>
        )}
      </div>

      {error && <p className="text-xs text-danger">{error.message}</p>}
    </div>
  );
}
