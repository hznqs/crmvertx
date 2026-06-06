import { PermissionGate } from "@/components/auth/permission-gate";
import { CommissionCreateButton } from "@/components/commissions/commission-create-button";
import { CommissionFilters } from "@/components/commissions/commission-filters";
import { CommissionMetricsPanel } from "@/components/commissions/commission-metrics";
import { CommissionRankingPanel } from "@/components/commissions/commission-ranking";
import { CommissionTable } from "@/components/commissions/commission-table";
import { fetchCommissions, fetchCommissionMetrics, fetchCommissionRanking } from "@/lib/api/commissions";
import { fetchContracts } from "@/lib/api/contracts";
import { fetchTeamMembers } from "@/lib/api/team";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildCommissionQuery } from "@/lib/commissions/query";
import { buildContractQuery } from "@/lib/contracts/query";
import { buildTeamQuery } from "@/lib/team/query";
import type { CommissionSearchParams, CommissionSelectOption } from "@/lib/types/commissions";

type CommissionsPageProps = {
  searchParams: Promise<CommissionSearchParams>;
};

export default async function CommissionsPage({ searchParams }: CommissionsPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "COMMISSIONS");
  const query = buildCommissionQuery(resolvedSearchParams);
  const [commissionPage, metrics, ranking, teamPage, contractPage] = await Promise.all([
    fetchCommissions(query),
    fetchCommissionMetrics(query.memberId),
    fetchCommissionRanking(),
    fetchTeamMembers(buildTeamQuery({ size: "100" })),
    fetchContracts(buildContractQuery({ size: "100", status: "ativo" }))
  ]);
  const memberOptions = teamPage.content.map(toMemberOption);
  const contractOptions = contractPage.content.map((contract) => ({
    id: contract.id,
    label: contract.plan
  }));
  const loadError = commissionPage.loadError ?? metrics.loadError ?? ranking.loadError ?? teamPage.loadError ?? contractPage.loadError;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Vendas e incentivo
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Comissoes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Controle de comissoes por venda, renovacao, recorrencia, bonus e
            pagamentos com ranking operacional da equipe comercial.
          </p>
        </div>
        <PermissionGate module="COMMISSIONS" level="write" role={user?.role ?? null}>
          <CommissionCreateButton memberOptions={memberOptions} contractOptions={contractOptions} />
        </PermissionGate>
      </section>

      <CommissionMetricsPanel metrics={metrics} ranking={ranking} />
      <CommissionRankingPanel ranking={ranking} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <CommissionFilters query={query} memberOptions={memberOptions} />
        <CommissionTable
          commissionPage={commissionPage}
          memberOptions={memberOptions}
          contractOptions={contractOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toMemberOption(member: { id: string; name: string }): CommissionSelectOption {
  return { id: member.id, label: member.name };
}
