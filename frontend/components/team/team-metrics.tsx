import { MetricCard } from "@/components/app/metric-card";
import type { TeamSummary } from "@/lib/types/team";

type TeamMetricsProps = {
  summary: TeamSummary;
};

export function TeamMetrics({ summary }: TeamMetricsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Membros" value={String(summary.total)} helper="Equipe ativa no filtro" />
      <MetricCard label="Tarefas" value={String(summary.tasks)} helper={`${summary.completed} concluidas`} />
      <MetricCard label="Produtividade" value={`${summary.productivity}%`} helper="Conclusao geral" />
      <MetricCard label="Comercial/Dev" value={`${summary.sdr + summary.closer}/${summary.developer}`} helper="SDR+closer / devs" />
    </section>
  );
}
