import { PermissionGate } from "@/components/auth/permission-gate";
import { TeamCreateButton } from "@/components/team/team-create-button";
import { TeamFilters } from "@/components/team/team-filters";
import { TeamMetrics } from "@/components/team/team-metrics";
import { TeamTable } from "@/components/team/team-table";
import { fetchTeamMembers, fetchTeamSummary } from "@/lib/api/team";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildTeamQuery } from "@/lib/team/query";
import type { TeamSearchParams } from "@/lib/types/team";

type TeamPageProps = {
  searchParams: Promise<TeamSearchParams>;
};

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "TEAM");
  const query = buildTeamQuery(resolvedSearchParams);
  const [teamPage, summary] = await Promise.all([
    fetchTeamMembers(query),
    fetchTeamSummary({ role: query.role, search: query.search })
  ]);
  const loadError = teamPage.loadError ?? summary.loadError;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Capacidade operacional
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Equipe
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Membros, cargos, tarefas, produtividade, capacidade mensal e custo
            hora para equilibrar a operacao sem sobrecarga.
          </p>
        </div>
        <PermissionGate module="TEAM" level="write" role={user?.role ?? null}>
          <TeamCreateButton />
        </PermissionGate>
      </section>

      <TeamMetrics summary={summary} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <TeamFilters query={query} />
        <TeamTable teamPage={teamPage} actionPermissions={actionPermissions} />
      </section>
    </main>
  );
}
