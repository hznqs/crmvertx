"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { deliveryKanbanStatuses, normalizeDeliveryStatus } from "@/lib/deliveries/kanban";
import { deliveryStatusLabels } from "@/lib/deliveries/labels";
import { chartColors, chartTooltipStyle } from "@/lib/theme/chart";
import type { Delivery } from "@/lib/types/deliveries";

type DeliveryKanbanAnalyticsProps = {
  deliveries: Delivery[];
};

export function DeliveryKanbanAnalytics({ deliveries }: DeliveryKanbanAnalyticsProps) {
  const chartData = deliveryKanbanStatuses.map((status) => ({
    status: deliveryStatusLabels[status],
    total: deliveries.filter((delivery) => normalizeDeliveryStatus(delivery.status) === status).length
  }));

  return (
    <section className="crm-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-400">Analytics operacional</p>
          <h2 className="mt-1 text-lg font-black text-white">Distribuicao por etapa</h2>
        </div>
        <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-black text-fuchsia-100">
          {deliveries.length} cards
        </span>
      </div>
      <div className="mt-5 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
            <XAxis dataKey="status" tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: chartColors.cursor }}
              contentStyle={chartTooltipStyle}
            />
            <Bar dataKey="total" fill={chartColors.brand} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
