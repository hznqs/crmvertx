import type { DashboardMetrics } from "@/lib/types/dashboard";

type DashboardHealthProps = {
  metrics: DashboardMetrics;
};

export function DashboardHealth({ metrics }: DashboardHealthProps) {
  const items = [
    { label: "Contratos vencendo", value: metrics.contractsExpiring, helper: "30 dias", tone: "text-amber-100" },
    { label: "Risco operacional", value: `${Number(metrics.operationalRiskRate ?? 0).toFixed(1)}%`, helper: `${metrics.projectsAtRisk} projetos em risco`, tone: "text-rose-100" },
    { label: "Tarefas abertas", value: metrics.openTasks, helper: `${metrics.lateTasks} atrasadas`, tone: "text-sky-100" },
    { label: "Entregas abertas", value: metrics.pendingDeliveries + metrics.productionDeliveries + metrics.reviewDeliveries, helper: `${metrics.lateDeliveries} atrasadas`, tone: "text-fuchsia-100" }
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-xl bg-panel/95 p-5 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
          <p className={`mt-4 text-3xl font-bold ${item.tone}`}>{item.value}</p>
          <p className="mt-2 text-sm text-muted">{item.helper}</p>
        </article>
      ))}
    </section>
  );
}
