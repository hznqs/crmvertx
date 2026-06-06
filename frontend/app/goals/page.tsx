import { PermissionGate } from "@/components/auth/permission-gate";
import { GoalCreateButton } from "@/components/goals/goal-create-button";
import { GoalFilters } from "@/components/goals/goal-filters";
import { GoalMetrics } from "@/components/goals/goal-metrics";
import { GoalTable } from "@/components/goals/goal-table";
import { fetchGoals } from "@/lib/api/goals";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildGoalQuery } from "@/lib/goals/query";
import type { GoalSearchParams } from "@/lib/types/goals";

type GoalsPageProps = {
  searchParams: Promise<GoalSearchParams>;
};

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "GOALS");
  const query = buildGoalQuery(resolvedSearchParams);
  const goalPage = await fetchGoals(query);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Performance
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Metas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Metas de faturamento, vendas, clientes, reunioes, entregas e lucro
            com progresso calculado pelo backend.
          </p>
        </div>
        <PermissionGate module="GOALS" level="write" role={user?.role ?? null}>
          <GoalCreateButton />
        </PermissionGate>
      </section>

      <GoalMetrics goals={goalPage.content} totalElements={goalPage.totalElements} />

      {goalPage.loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {goalPage.loadError} Verifique se o backend foi reiniciado com a versao mais recente.
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <GoalFilters query={query} />
        <GoalTable goalPage={goalPage} actionPermissions={actionPermissions} />
      </section>
    </main>
  );
}
