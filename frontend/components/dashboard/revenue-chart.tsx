"use client";

import { formatCurrency, formatDate } from "@/lib/formatters";
import { chartColors, chartTooltipStyle } from "@/lib/theme/chart";
import type { RevenueChartPoint } from "@/lib/types/dashboard";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type RevenueChartProps = {
  points: RevenueChartPoint[];
};

export function RevenueChart({ points }: RevenueChartProps) {
  const chartData = points.map((point) => ({
    date: point.date,
    label: formatDate(point.date),
    revenue: Number(point.revenue ?? 0)
  }));

  return (
    <section className="crm-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">Receita</p>
          <h2 className="mt-1 text-lg font-bold text-white">Faturamento diario</h2>
        </div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-300">{points.length} dias</span>
      </div>
      <div className="mt-6 h-72 overflow-hidden rounded-xl border border-line bg-white/[0.025] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.38} />
                <stop offset="95%" stopColor={chartColors.brand} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartColors.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: chartColors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: chartColors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(value) => formatCurrency(value).replace(",00", "")}
            />
            <Tooltip
              cursor={{ stroke: chartColors.brand, strokeOpacity: 0.35, strokeWidth: 1 }}
              contentStyle={chartTooltipStyle}
              formatter={(value) => [formatCurrency(Number(value)), "Receita"]}
              labelFormatter={(label) => String(label)}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={chartColors.success}
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              activeDot={{ r: 5, fill: chartColors.brand, stroke: "#090909", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
