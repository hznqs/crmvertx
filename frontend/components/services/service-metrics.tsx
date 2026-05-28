import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { ServiceOffering } from "@/lib/types/services";

type ServiceMetricsProps = {
  services: ServiceOffering[];
  totalElements: number;
};

export function ServiceMetrics({ services, totalElements }: ServiceMetricsProps) {
  const recurring = services.filter((service) => ["MENSAL", "RECORRENTE"].includes(service.billingType)).length;
  const active = services.filter((service) => service.active !== false).length;
  const averagePrice = services.length
    ? services.reduce((total, service) => total + Number(service.basePrice ?? 0), 0) / services.length
    : 0;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Servicos no filtro" value={String(totalElements)} helper="Catalogo server-side" />
      <MetricCard label="Ativos" value={String(active)} helper="Disponiveis para venda" />
      <MetricCard label="Recorrentes" value={String(recurring)} helper="Base de receita mensal" />
      <MetricCard label="Preco medio" value={formatCurrency(averagePrice)} helper="Media da pagina carregada" />
    </section>
  );
}
