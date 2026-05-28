import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { Client } from "@/lib/types/clients";

type ClientMetricsProps = {
  clients: Client[];
  totalElements: number;
};

export function ClientMetrics({ clients, totalElements }: ClientMetricsProps) {
  const active = clients.filter((client) => client.status === "ATIVO").length;
  const atRisk = clients.filter((client) => client.status === "EM_RISCO").length;
  const contractValue = clients.reduce((total, client) => total + Number(client.value ?? 0), 0);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Clientes no filtro" value={String(totalElements)} helper="Consulta server-side" />
      <MetricCard label="Ativos" value={String(active)} helper="Base operacional saudavel" />
      <MetricCard label="Em risco" value={String(atRisk)} helper="Prioridade de retencao" />
      <MetricCard label="Contratos na pagina" value={formatCurrency(contractValue)} helper="Soma dos valores mensais" />
    </section>
  );
}
