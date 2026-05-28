import { MetricCard } from "@/components/app/metric-card";
import { formatGoalValue } from "@/components/goals/goal-value";
import type { Goal } from "@/lib/types/goals";

type GoalMetricsProps = {
  goals: Goal[];
  totalElements: number;
};

export function GoalMetrics({ goals, totalElements }: GoalMetricsProps) {
  const averageProgress = goals.length
    ? Math.round(goals.reduce((total, goal) => total + Number(goal.progress ?? 0), 0) / goals.length)
    : 0;
  const completed = goals.filter((goal) => Number(goal.progress ?? 0) >= 100).length;
  const totalTarget = goals.reduce((total, goal) => total + Number(goal.target ?? 0), 0);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Metas no filtro" value={String(totalElements)} helper="Planejamento ativo" />
      <MetricCard label="Progresso medio" value={`${averageProgress}%`} helper="Media da pagina" />
      <MetricCard label="Concluidas" value={String(completed)} helper="Atingiram 100%" />
      <MetricCard label="Alvo somado" value={formatGoalValue("FATURAMENTO", totalTarget)} helper="Soma numerica do filtro" />
    </section>
  );
}
