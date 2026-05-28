import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { CommissionMetrics, CommissionRanking } from "@/lib/types/commissions";

type CommissionMetricsProps = {
  metrics: CommissionMetrics;
  ranking: CommissionRanking;
};

export function CommissionMetricsPanel({ metrics, ranking }: CommissionMetricsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Vendas" value={String(metrics.totalSales)} helper="No filtro atual" />
      <MetricCard label="Receita vendida" value={formatCurrency(metrics.totalRevenue)} helper="Base de comissao" />
      <MetricCard label="Comissoes" value={formatCurrency(metrics.totalCommission)} helper="Total calculado" />
      <MetricCard label="Meta comercial" value={`${Number(ranking.averageGoalProgress ?? 0).toFixed(0)}%`} helper="Media SDR/closer" />
    </section>
  );
}
