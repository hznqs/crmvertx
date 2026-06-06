import { PermissionGate } from "@/components/auth/permission-gate";
import { fetchProjects } from "@/lib/api/projects";
import { fetchTasks } from "@/lib/api/tasks";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildTaskQuery } from "@/lib/tasks/query";
import type { TaskProjectOption, TaskSearchParams } from "@/lib/types/tasks";
import { TaskCreateButton } from "@/components/tasks/task-create-button";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskMetrics } from "@/components/tasks/task-metrics";
import { TaskTable } from "@/components/tasks/task-table";

type TasksPageProps = {
  searchParams: Promise<TaskSearchParams>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "TASKS");
  const query = buildTaskQuery(resolvedSearchParams);
  const [taskPage, projectPage] = await Promise.all([
    fetchTasks(query),
    fetchProjects(buildProjectQuery({ size: "100", active: "true" }))
  ]);
  const projectOptions = projectPage.content.map(toProjectOption);
  const loadError = taskPage.loadError ?? projectPage.loadError;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Execucao operacional
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Tarefas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Fila de trabalho por projeto com prioridade, prazo, status e
            responsavel para manter entregas e SLA sob controle.
          </p>
        </div>
        <PermissionGate module="TASKS" level="write" role={user?.role ?? null}>
          <TaskCreateButton projectOptions={projectOptions} />
        </PermissionGate>
      </section>

      <TaskMetrics tasks={taskPage.content} totalElements={taskPage.totalElements} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <TaskFilters query={query} projectOptions={projectOptions} />
        <TaskTable taskPage={taskPage} projectOptions={projectOptions} actionPermissions={actionPermissions} />
      </section>
    </main>
  );
}

function toProjectOption(project: { id: string; name: string }): TaskProjectOption {
  return { id: project.id, label: project.name };
}
