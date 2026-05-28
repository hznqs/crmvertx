import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import { sumPotentialValue } from "@/lib/pipeline/metrics";
import type { Lead } from "@/lib/types/leads";

type PipelineMetricsProps = {
  leads: Lead[];
  totalElements: number;
};

export function PipelineMetrics({ leads, totalElements }: PipelineMetricsProps) {
  const won = leads.filter((lead) => lead.commercialStage === "FECHADO").length;
  const hot = leads.filter((lead) => lead.temperature === "QUENTE").length;
  const potentialValue = sumPotentialValue(leads);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Oportunidades" value={String(totalElements)} helper="Leads ativos no funil" />
      <MetricCard label="Potencial" value={formatCurrency(potentialValue)} helper="Valor da pagina carregada" />
      <MetricCard label="Quentes" value={String(hot)} helper="Prioridade comercial" />
      <MetricCard label="Fechados" value={String(won)} helper="Ganhos no recorte atual" />
    </section>
  );
}
