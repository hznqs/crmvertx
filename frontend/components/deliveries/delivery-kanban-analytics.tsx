"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { deliveryKanbanStatuses, normalizeDeliveryStatus } from "@/lib/deliveries/kanban";
import { deliveryStatusLabels } from "@/lib/deliveries/labels";
import { chartColors } from "@/lib/theme/chart";
import type { Delivery } from "@/lib/types/deliveries";
import { ChartFrame } from "@/components/ui/chart-frame";
import { ChartCard, ChartEmptyState, PremiumChartTooltip } from "@/components/ui/premium-chart";

type DeliveryKanbanAnalyticsProps = {
  deliveries: Delivery[];
};

export function DeliveryKanbanAnalytics({ deliveries }: DeliveryKanbanAnalyticsProps) {
  const chartData = deliveryKanbanStatuses.map((status) => ({
    status: deliveryStatusLabels[status],
    total: deliveries.filter((delivery) => normalizeDeliveryStatus(delivery.status) === status).length
  }));
  const hasData = chartData.some((item) => item.total > 0);

  return (
    <ChartCard
      eyebrow="Analytics operacional"
      title="Distribuicao por etapa"
      subtitle="Leitura rapida da carga de trabalho no fluxo de entregas."
      metric={String(deliveries.length)}
      badge="cards"
    >
      <ChartFrame className="mt-6 h-56 min-h-56 min-w-0 overflow-hidden rounded-xl border border-brand-400/10 bg-[#090909]/30 p-3">
        {hasData ? (
          ({ width, height }) => (
          <BarChart width={width} height={height} data={chartData} margin={{ left: -16, right: 8, top: 12, bottom: 0 }}>
            <CartesianGrid stroke={chartColors.grid} vertical={false} strokeDasharray="4 8" />
            <XAxis dataKey="status" tick={{ fill: chartColors.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: chartColors.cursor }}
              content={<PremiumChartTooltip />}
            />
            <Bar dataKey="total" name="Entregas" fill={chartColors.brand} radius={[10, 10, 0, 0]} maxBarSize={42} />
          </BarChart>
          )
        ) : (
          () => <ChartEmptyState title="Sem entregas por etapa" description="Quando houver cards no kanban, a distribuicao operacional aparecera aqui." />
        )}
      </ChartFrame>
    </ChartCard>
  );
}
