import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { FinanceSummary } from "@/lib/types/finance";

type FinanceMetricsProps = {
  summary: FinanceSummary;
};

export function FinanceMetrics({ summary }: FinanceMetricsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Receita bruta" value={formatCurrency(summary.grossRevenue)} helper="Entradas do periodo" />
      <MetricCard label="Lucro liquido" value={formatCurrency(summary.netProfit)} helper={`${Number(summary.margin ?? 0).toFixed(1)}% de margem`} />
      <MetricCard label="Previsao" value={formatCurrency(summary.forecast)} helper="Recorrente + receita" />
      <MetricCard label="Vencido" value={formatCurrency(summary.overdue)} helper={`${summary.autoBillingCount} auto cobrancas`} />
    </section>
  );
}
