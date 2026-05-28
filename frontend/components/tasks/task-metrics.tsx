import { MetricCard } from "@/components/app/metric-card";
import type { Task } from "@/lib/types/tasks";

type TaskMetricsProps = {
  tasks: Task[];
  totalElements: number;
};

export function TaskMetrics({ tasks, totalElements }: TaskMetricsProps) {
  const critical = tasks.filter((task) => task.priority === "CRITICA").length;
  const overdue = tasks.filter((task) => task.overdue || task.status === "ATRASADA").length;
  const review = tasks.filter((task) => task.status === "EM_REVISAO").length;
  const done = tasks.filter((task) => task.status === "CONCLUIDA").length;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Tarefas no filtro" value={String(totalElements)} helper="Fila server-side" />
      <MetricCard label="Criticas" value={String(critical)} helper="Prioridade maxima" />
      <MetricCard label="Atrasadas" value={String(overdue)} helper="Prazo estourado" />
      <MetricCard label="Concluidas" value={String(done + review)} helper="Entrega e revisao" />
    </section>
  );
}
