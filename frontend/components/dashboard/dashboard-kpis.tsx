import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { DashboardMetrics } from "@/lib/types/dashboard";

type DashboardKpisProps = {
  metrics: DashboardMetrics;
};

export function DashboardKpis({ metrics }: DashboardKpisProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard tone="brand" label="Receita do periodo" value={formatCurrency(metrics.monthlyRevenue)} helper={`${Number(metrics.monthlyGrowth ?? 0).toFixed(1)}% vs periodo anterior`} />
      <MetricCard tone="success" label="Lucro liquido" value={formatCurrency(metrics.netProfit)} helper={`${Number(metrics.profitMargin ?? 0).toFixed(1)}% de margem`} />
      <MetricCard tone="neutral" label="MRR" value={formatCurrency(metrics.mrr)} helper={`${metrics.activeContracts} contratos ativos`} />
      <MetricCard tone="warning" label="Conversao" value={`${Number(metrics.conversionRate ?? 0).toFixed(1)}%`} helper={`${metrics.completedMeetings} reunioes executadas`} />
    </section>
  );
}
