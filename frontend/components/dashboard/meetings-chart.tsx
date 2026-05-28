"use client";

import { formatDate } from "@/lib/formatters";
import { chartColors, chartTooltipStyle } from "@/lib/theme/chart";
import type { MeetingsSalesChartPoint } from "@/lib/types/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
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

  return (
    <section className="crm-surface p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">Comercial</p>
        <h2 className="mt-1 text-lg font-bold text-white">Reunioes e fechamentos</h2>
      </div>
      <div className="mt-6 h-72 overflow-hidden rounded-xl border border-line bg-white/[0.025] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -12, right: 8, top: 12, bottom: 0 }}>
            <CartesianGrid stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="label" tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: chartColors.cursor }}
              contentStyle={chartTooltipStyle}
            />
            <Legend wrapperStyle={{ color: chartColors.muted, fontSize: 12 }} />
            <Bar dataKey="meetings" name="Reunioes" fill={chartColors.brand} radius={[8, 8, 2, 2]} />
            <Bar dataKey="closings" name="Vendas" fill={chartColors.success} radius={[8, 8, 2, 2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
