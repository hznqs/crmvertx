import { MetricCard } from "@/components/app/metric-card";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import type { DeliverySummary } from "@/lib/types/deliveries";
import type { TeamSummary } from "@/lib/types/team";

type OperationalKpisProps = {
  metrics: DashboardMetrics;
  deliverySummary: DeliverySummary;
  teamSummary: TeamSummary;
};

export function OperationalKpis({ metrics, deliverySummary, teamSummary }: OperationalKpisProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Projetos em risco" value={String(metrics.projectsAtRisk)} helper={`${metrics.projectsInExecution} em execucao`} />
      <MetricCard label="Tarefas atrasadas" value={String(metrics.lateTasks)} helper={`${metrics.openTasks} tarefas abertas`} />
      <MetricCard label="Entregas atrasadas" value={String(metrics.lateDeliveries || deliverySummary.late)} helper={`${metrics.reviewDeliveries || deliverySummary.review} em revisao`} />
      <MetricCard label="Produtividade" value={`${teamSummary.productivity}%`} helper={`${teamSummary.completed}/${teamSummary.tasks} tarefas`} />
    </section>
  );
}
