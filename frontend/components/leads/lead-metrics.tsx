import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { Lead } from "@/lib/types/leads";

type LeadMetricsProps = {
  leads: Lead[];
  totalElements: number;
};

export function LeadMetrics({ leads, totalElements }: LeadMetricsProps) {
  const hotLeads = leads.filter((lead) => lead.temperature === "QUENTE").length;
  const proposalLeads = leads.filter(
    (lead) => lead.commercialStage === "PROPOSTA"
  ).length;
  const potentialValue = leads.reduce(
    (total, lead) => total + Number(lead.potentialValue ?? 0),
    0
  );

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Leads no filtro"
        value={String(totalElements)}
        helper="Resultado da consulta server-side"
      />
      <MetricCard
        label="Quentes"
        value={String(hotLeads)}
        helper="Oportunidades com maior intencao"
      />
      <MetricCard
        label="Em proposta"
        value={String(proposalLeads)}
        helper="Fase critica para fechamento"
      />
      <MetricCard
        label="Valor potencial"
        value={formatCurrency(potentialValue)}
        helper="Soma da pagina carregada"
      />
    </section>
  );
}
