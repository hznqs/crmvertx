"use client";

import { useFormStatus } from "react-dom";

type ServiceSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "primary" | "danger";
};

export function ServiceSubmitButton({
  idleLabel,
  pendingLabel,
  tone = "primary"
}: ServiceSubmitButtonProps) {
  const { pending } = useFormStatus();
  const toneClassName =
    tone === "danger"
      ? "bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
      : "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:brightness-110";

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
