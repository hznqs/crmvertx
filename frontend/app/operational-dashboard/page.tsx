import { OperationalCapacity } from "@/components/operational-dashboard/operational-capacity";
import { OperationalKpis } from "@/components/operational-dashboard/operational-kpis";
import { OperationalProjects } from "@/components/operational-dashboard/operational-projects";
import { OperationalTasks } from "@/components/operational-dashboard/operational-tasks";
import { fetchDashboardMetrics } from "@/lib/api/dashboard";
import { fetchDeliveries, fetchDeliverySummary } from "@/lib/api/deliveries";
import { fetchProjects } from "@/lib/api/projects";
import { fetchTasks } from "@/lib/api/tasks";
import { fetchTeamSummary } from "@/lib/api/team";
import { buildDeliveryQuery } from "@/lib/deliveries/query";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildTaskQuery } from "@/lib/tasks/query";

export default async function OperationalDashboardPage() {
  const [metrics, projectPage, taskPage, deliverySummary, teamSummary] = await Promise.all([
    fetchDashboardMetrics({ from: "", to: "" }),
    fetchProjects(buildProjectQuery({ status: "EM_EXECUCAO", active: "true", size: "8" })),
    fetchTasks(buildTaskQuery({ status: "ATRASADA", active: "true", size: "8" })),
    fetchDeliverySummary({ clientId: "", owner: "" }),
    fetchTeamSummary({ role: "", search: "" })
  ]);

  return (
    <main className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
          Dashboard operacional
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Operacao em tempo real
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          SLA, tarefas criticas, entregas em revisao e capacidade da equipe em
          uma visao feita para gestao diaria.
        </p>
      </section>

      {metrics.sourceUnavailable || projectPage.sourceUnavailable || taskPage.sourceUnavailable || deliverySummary.sourceUnavailable || teamSummary.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar o dashboard operacional real.
        </div>
      ) : null}

      <OperationalKpis metrics={metrics} deliverySummary={deliverySummary} teamSummary={teamSummary} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <OperationalProjects projects={projectPage.content} />
        <OperationalTasks tasks={taskPage.content} />
      </section>

      <OperationalCapacity deliverySummary={deliverySummary} teamSummary={teamSummary} />
    </main>
  );
}
