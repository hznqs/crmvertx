import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { Project } from "@/lib/types/projects";

type ProjectMetricsProps = {
  projects: Project[];
  totalElements: number;
};

const riskStatuses = new Set(["EM_REVISAO", "AGUARDANDO_CLIENTE", "PAUSADO"]);

export function ProjectMetrics({ projects, totalElements }: ProjectMetricsProps) {
  const averageProgress = projects.length
    ? Math.round(projects.reduce((total, project) => total + Number(project.progress ?? 0), 0) / projects.length)
    : 0;
  const atRisk = projects.filter((project) => riskStatuses.has(project.status)).length;
  const overdue = projects.filter((project) => isOverdue(project.slaDueDate) && project.status !== "FINALIZADO").length;
  const projectedProfit = projects.reduce((total, project) => total + Number(project.estimatedProfit ?? 0), 0);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Projetos no filtro" value={String(totalElements)} helper="Execucao server-side" />
      <MetricCard label="Progresso medio" value={`${averageProgress}%`} helper="Media da pagina carregada" />
      <MetricCard label="SLA em risco" value={String(overdue + atRisk)} helper="Atrasos e bloqueios" />
      <MetricCard label="Lucro estimado" value={formatCurrency(projectedProfit)} helper="Soma da pagina carregada" />
    </section>
  );
}

function isOverdue(value: string | null) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value) < today;
}
