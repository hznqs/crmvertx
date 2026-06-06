"use client";

import { formatDate } from "@/lib/formatters";
import { chartColors } from "@/lib/theme/chart";
import type { MeetingsSalesChartPoint } from "@/lib/types/dashboard";
import { ChartFrame } from "@/components/ui/chart-frame";
import { ChartCard, ChartEmptyState, PremiumChartTooltip } from "@/components/ui/premium-chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type MeetingsChartProps = {
  points: MeetingsSalesChartPoint[];
};

export function MeetingsChart({ points }: MeetingsChartProps) {
  const chartData = points.slice(-12).map((point) => ({
    date: point.date,
    label: formatDate(point.date),
    meetings: point.meetings,
    closings: point.closings
  }));
  const hasData = chartData.some((point) => point.meetings > 0 || point.closings > 0);
  const meetings = chartData.reduce((total, point) => total + point.meetings, 0);
  const closings = chartData.reduce((total, point) => total + point.closings, 0);

  return (
    <ChartCard
      eyebrow="Comercial"
      title="Reunioes e fechamentos"
      subtitle="Comparativo entre reunioes executadas e vendas fechadas."
      metric={`${closings}/${meetings}`}
      badge="fechamentos/reunioes"
    >
      <ChartFrame className="mt-6 h-72 min-h-72 min-w-0 overflow-hidden rounded-xl border border-brand-400/10 bg-[#090909]/30 p-3">
        {hasData ? (
          ({ width, height }) => (
          <BarChart width={width} height={height} data={chartData} margin={{ left: -12, right: 8, top: 16, bottom: 0 }} barGap={6}>
            <CartesianGrid stroke={chartColors.grid} vertical={false} strokeDasharray="4 8" />
            <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: chartColors.cursor }}
              content={<PremiumChartTooltip />}
            />
            <Legend wrapperStyle={{ color: chartColors.muted, fontSize: 12 }} />
            <Bar dataKey="meetings" name="Reunioes" fill={chartColors.brand} radius={[10, 10, 3, 3]} maxBarSize={42} />
            <Bar dataKey="closings" name="Vendas" fill={chartColors.success} radius={[10, 10, 3, 3]} maxBarSize={42} />
          </BarChart>
          )
        ) : (
          () => <ChartEmptyState title="Sem reunioes no periodo" description="Agende reunioes e registre fechamentos para comparar a produtividade comercial." />
        )}
      </ChartFrame>
    </ChartCard>
  );
}
