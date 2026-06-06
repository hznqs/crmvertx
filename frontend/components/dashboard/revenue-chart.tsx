"use client";

import { formatCurrency, formatDate } from "@/lib/formatters";
import { chartColors } from "@/lib/theme/chart";
import type { RevenueChartPoint } from "@/lib/types/dashboard";
import { ChartFrame } from "@/components/ui/chart-frame";
import { ChartCard, ChartEmptyState, PremiumChartTooltip } from "@/components/ui/premium-chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  const hasData = chartData.some((point) => point.revenue > 0);
  const totalRevenue = chartData.reduce((total, point) => total + point.revenue, 0);

  return (
    <ChartCard
      eyebrow="Receita"
      title="Faturamento diario"
      subtitle="Evolucao da receita no periodo selecionado."
      metric={formatCurrency(totalRevenue)}
      badge={`${points.length} dias`}
    >
      <ChartFrame className="mt-6 h-72 min-h-72 min-w-0 overflow-hidden rounded-xl border border-brand-400/10 bg-[#090909]/30 p-3">
        {hasData ? (
          ({ width, height }) => (
          <AreaChart width={width} height={height} data={chartData} margin={{ left: 0, right: 10, top: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.success} stopOpacity={0.45} />
                <stop offset="48%" stopColor={chartColors.brand} stopOpacity={0.18} />
                <stop offset="100%" stopColor={chartColors.brand} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartColors.grid} vertical={false} strokeDasharray="4 8" />
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
              content={<PremiumChartTooltip valueFormatter={(value) => formatCurrency(Number(value))} />}
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
          )
        ) : (
          () => <ChartEmptyState title="Sem receita no periodo" description="Cadastre contratos ou lancamentos financeiros para visualizar a curva de receita." />
        )}
      </ChartFrame>
    </ChartCard>
  );
}
