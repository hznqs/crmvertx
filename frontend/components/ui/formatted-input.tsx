"use client";

import type { InputHTMLAttributes } from "react";
import { useId, useRef } from "react";
import { useMask } from "@/hooks/use-mask";
import type { MaskType } from "@/lib/forms/masks";
import { cn } from "@/lib/utils";

type FormattedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "name" | "type" | "onChange"> & {
  name: string;
  mask: MaskType;
  defaultValue?: string | number | null;
  className?: string;
  onValueChange?: (submitValue: string) => void;
};

const keyboardByMask: Partial<Record<MaskType, InputHTMLAttributes<HTMLInputElement>["inputMode"]>> = {
  cpf: "numeric",
  cnpj: "numeric",
  cpfCnpj: "numeric",
  phone: "tel",
  cep: "numeric",
  currency: "numeric",
  percentage: "numeric",
  integer: "numeric",
  decimal: "decimal",
  date: "numeric",
  email: "email"
};

const selectionSupportedInputTypes = new Set(["", "text", "search", "tel", "url", "password"]);

export function FormattedInput({
  name,
  mask,
  defaultValue,
  className,
  required,
  placeholder,
  autoComplete,
  onValueChange,
  ...props
}: FormattedInputProps) {
  const { displayValue, submitValue, error, setRawValue, setTouched } = useMask({
    type: mask,
    defaultValue,
    required
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  return (
    <span className="grid gap-1">
      <input type="hidden" name={name} value={submitValue} />
      <input
        {...props}
        ref={inputRef}
        value={displayValue}
        type={mask === "email" ? "email" : "text"}
        inputMode={keyboardByMask[mask]}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn("crm-control w-full", error && "border-rose-400/60 shadow-[0_0_0_4px_rgba(251,113,133,.12)]", className)}
        onBlur={() => setTouched(true)}
        onChange={(event) => {
          const target = event.currentTarget;
          const caretFromEnd = target.value.length - (target.selectionStart ?? target.value.length);
          const next = setRawValue(target.value);
          onValueChange?.(next.submitValue);
          requestAnimationFrame(() => {
            const input = inputRef.current;
            if (!input) return;
            if (!selectionSupportedInputTypes.has(input.type)) return;
            const nextPosition = Math.max(0, input.value.length - caretFromEnd);
            input.setSelectionRange(nextPosition, nextPosition);
          });
        }}
        onPaste={(event) => {
          event.preventDefault();
          const next = setRawValue(event.clipboardData.getData("text"));
          onValueChange?.(next.submitValue);
        }}
      />
      {error ? (
        <span id={errorId} className="text-xs font-semibold text-rose-200">
          {error}
        </span>
      ) : null}
    </span>
  );
}
