import { MetricCard } from "@/components/app/metric-card";
import type { DeliverySummary } from "@/lib/types/deliveries";

type DeliveryMetricsProps = {
  summary: DeliverySummary;
};

export function DeliveryMetrics({ summary }: DeliveryMetricsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Pendentes" value={String(summary.pending)} helper="Aguardando inicio" />
      <MetricCard label="Em producao" value={String(summary.production)} helper="Execucao ativa" />
      <MetricCard label="Em revisao" value={String(summary.review)} helper="Dependem de validacao" />
      <MetricCard label="Atrasadas" value={String(summary.late)} helper={`${summary.approved} aprovadas`} />
    </section>
  );
}
