"use client";

import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChartCardProps = Readonly<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  metric?: string;
  badge?: string;
  trend?: {
    value: string;
    tone: "positive" | "negative" | "neutral";
  };
  children: ReactNode;
  className?: string;
}>;

type TooltipPayload = {
  name?: string | number;
  value?: string | number;
  color?: string;
};

type PremiumChartTooltipProps = Readonly<{
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
  valueFormatter?: (value: string | number) => string;
  labelFormatter?: (label: string | number) => string;
}>;

export function ChartCard({
  eyebrow,
  title,
  subtitle,
  metric,
  badge,
  trend,
  children,
  className
}: ChartCardProps) {
  return (
    <section className={cn("crm-chart-card p-5", className)}>
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-400">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="min-w-0 break-words text-lg font-black text-white">{title}</h2>
            {metric ? <strong className="text-2xl font-black tracking-tight text-white">{metric}</strong> : null}
          </div>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {trend ? (
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-black",
                trend.tone === "positive" && "border-emerald-300/20 bg-emerald-500/10 text-emerald-100",
                trend.tone === "negative" && "border-rose-300/20 bg-rose-500/10 text-rose-100",
                trend.tone === "neutral" && "border-line bg-white/[0.06] text-zinc-300"
              )}
            >
              {trend.value}
            </span>
          ) : null}
          {badge ? (
            <span className="rounded-full border border-line bg-white/[0.06] px-3 py-1 text-xs font-black text-zinc-300">
              {badge}
            </span>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function PremiumChartTooltip({
  active,
  label,
  payload,
  valueFormatter,
  labelFormatter
}: PremiumChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="max-w-[min(280px,calc(100vw-2rem))] rounded-xl border border-brand-400/20 bg-[#100d12]/95 px-3 py-2 text-sm text-white shadow-[0_18px_45px_rgba(0,0,0,.5),0_0_30px_rgba(106,13,173,.16)] backdrop-blur-xl">
      {label !== undefined ? (
        <p className="mb-2 border-b border-white/10 pb-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </p>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <div key={`${String(item.name ?? "valor")}-${index}`} className="flex min-w-0 items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-2 text-zinc-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color ?? "#ea59dc" }} />
              <span className="truncate">{String(item.name ?? "Valor")}</span>
            </span>
            <strong className="shrink-0 font-black text-white">
              {valueFormatter ? valueFormatter(item.value ?? 0) : String(item.value ?? 0)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-full min-h-56 rounded-xl border border-line bg-white/[0.025] p-4">
      <div className="h-full animate-pulse rounded-lg bg-gradient-to-br from-white/[0.08] via-brand-500/10 to-white/[0.03]" />
    </div>
  );
}

export function ChartEmptyState({
  label,
  title = "Sem dados no periodo",
  description = "Cadastre ou filtre dados para visualizar este grafico."
}: Readonly<{
  label?: string;
  title?: string;
  description?: string;
}>) {
  const displayTitle = label ?? title;

  return (
    <div className="grid h-full min-h-40 place-items-center rounded-xl border border-dashed border-brand-400/20 bg-[radial-gradient(circle_at_center,rgba(106,13,173,.16),rgba(255,255,255,.025)_55%,transparent)] px-4 text-center">
      <div className="max-w-xs">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-brand-300">
          <BarChart3 className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 font-black text-white">{displayTitle}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
