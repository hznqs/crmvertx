"use client";

import { chartColors } from "@/lib/theme/chart";
import type { ChartPointString } from "@/lib/types/dashboard";
import { ChartFrame } from "@/components/ui/chart-frame";
import { ChartCard, ChartEmptyState, PremiumChartTooltip } from "@/components/ui/premium-chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";

type AnalyticsBarChartProps = {
  title: string;
  subtitle: string;
  points: ChartPointString[];
  color?: string;
};

export function AnalyticsBarChart({ title, subtitle, points, color = chartColors.brand }: AnalyticsBarChartProps) {
  const chartData = points.map((point) => ({
    label: point.label,
    value: Number(point.value ?? 0)
  }));
  const hasData = chartData.some((point) => point.value > 0);
  const total = chartData.reduce((sum, point) => sum + point.value, 0);

  return (
    <ChartCard
      eyebrow={subtitle}
      title={title}
      subtitle="Distribuicao consolidada do periodo selecionado."
      metric={String(total)}
      badge={`${points.length} itens`}
    >
      <ChartFrame className="mt-6 h-72 min-h-72 min-w-0 overflow-hidden rounded-xl border border-brand-400/10 bg-[#090909]/30 p-3">
        {hasData ? (
          ({ width, height }) => (
          <BarChart width={width} height={height} data={chartData} margin={{ left: 0, right: 10, top: 16, bottom: 0 }} layout="vertical">
            <CartesianGrid stroke={chartColors.grid} horizontal={false} strokeDasharray="4 8" />
            <XAxis
              type="number"
              tick={{ fill: chartColors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fill: chartColors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              cursor={{ fill: "white", opacity: 0.05 }}
              content={<PremiumChartTooltip />}
            />
            <Bar dataKey="value" name="Quantidade" radius={[0, 10, 10, 0]} maxBarSize={34}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} opacity={0.8 + (index % 3) * 0.1} />
              ))}
            </Bar>
          </BarChart>
          )
        ) : (
          () => <ChartEmptyState title="Sem dados neste grafico" description="Quando houver dados reais no periodo, a distribuicao aparecera aqui." />
        )}
      </ChartFrame>
    </ChartCard>
  );
}
