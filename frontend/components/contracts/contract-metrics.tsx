import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { Contract, ContractSummary } from "@/lib/types/contracts";

type ContractMetricsProps = {
  contracts: Contract[];
  summary: ContractSummary;
};

export function ContractMetrics({ contracts, summary }: ContractMetricsProps) {
  const totalPortfolio = contracts.reduce((total, contract) => total + Number(contract.totalValue ?? 0), 0);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Contratos ativos" value={String(summary.active)} helper="Base recorrente" />
      <MetricCard label="MRR" value={formatCurrency(summary.mrr)} helper="Receita mensal recorrente" />
      <MetricCard label="Vencem em 30 dias" value={String(summary.expiringSoon)} helper="Renovacao e churn" />
      <MetricCard label="Carteira filtrada" value={formatCurrency(totalPortfolio)} helper="Soma da pagina carregada" />
    </section>
  );
}
