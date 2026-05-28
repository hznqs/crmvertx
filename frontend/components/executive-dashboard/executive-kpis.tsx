import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { BillingSummary } from "@/lib/types/billing";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import type { FinanceSummary } from "@/lib/types/finance";

type ExecutiveKpisProps = {
  billing: BillingSummary;
  dashboard: DashboardMetrics;
  finance: FinanceSummary;
};

export function ExecutiveKpis({ billing, dashboard, finance }: ExecutiveKpisProps) {
  const netProfit = Number(dashboard.netProfit ?? 0) !== 0 ? dashboard.netProfit : finance.netProfit;
  const profitMargin = Number(dashboard.profitMargin ?? 0) !== 0 ? dashboard.profitMargin : finance.margin;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Lucro estimado" value={formatCurrency(netProfit)} helper={`${Number(profitMargin ?? 0).toFixed(1)}% de margem`} />
      <MetricCard label="Receita contratada" value={formatCurrency(billing.totalRevenue)} helper={`${billing.activeContracts} contratos/clientes`} />
      <MetricCard label="MRR" value={formatCurrency(dashboard.mrr)} helper="Receita recorrente paga" />
      <MetricCard label="Ticket medio" value={formatCurrency(billing.averageTicket)} helper={`${Number(dashboard.monthlyGrowth ?? 0).toFixed(1)}% crescimento`} />
    </section>
  );
}
