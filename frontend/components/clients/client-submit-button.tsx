"use client";

import { useFormStatus } from "react-dom";

type ClientSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "primary" | "danger" | "ghost";
};

export function ClientSubmitButton({
  idleLabel,
  pendingLabel,
  tone = "primary"
}: ClientSubmitButtonProps) {
  const { pending } = useFormStatus();
  const toneClassName = {
    primary: "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:brightness-110",
    danger: "bg-rose-500/15 text-rose-100 hover:bg-rose-500/25",
    ghost: "bg-white/[0.06] text-zinc-200 hover:bg-white/[0.09]"
  }[tone];

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-bold transition disabled:cursor-wait disabled:opacity-65 ${toneClassName}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
