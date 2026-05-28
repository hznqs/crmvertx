import type { ButtonHTMLAttributes, ReactNode } from "react";

type RowActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "neutral" | "brand";
  children: ReactNode;
};

export function RowActionButton({
  tone = "neutral",
  className = "",
  children,
  type = "button",
  ...props
}: RowActionButtonProps) {
  const toneClassName = {
    neutral: "border border-line bg-white/[0.045] text-zinc-200 hover:border-brand-400/40 hover:bg-brand-500/15 hover:text-white",
    brand: "border border-brand-500/25 bg-brand-500/15 text-fuchsia-100 hover:border-brand-400/50 hover:bg-brand-500/25 hover:text-white"
  }[tone];

  return (
    <button
      type={type}
      className={[
        "rounded-crm px-3 py-2 text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,.035)] transition duration-premium ease-premium focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-55",
        toneClassName,
        className
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export function ReadOnlyActionLabel({ className = "" }: { className?: string }) {
  return (
    <span className={["text-xs font-semibold text-zinc-500", className].filter(Boolean).join(" ")}>
      Somente leitura
    </span>
  );
}
