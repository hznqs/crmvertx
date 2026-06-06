import { PermissionGate } from "@/components/auth/permission-gate";
import { FinanceCreateButton } from "@/components/finance/finance-create-button";
import { FinanceFilters } from "@/components/finance/finance-filters";
import { FinanceMetrics } from "@/components/finance/finance-metrics";
import { FinanceTable } from "@/components/finance/finance-table";
import { fetchClients } from "@/lib/api/clients";
import { fetchContracts } from "@/lib/api/contracts";
import { fetchFinanceEntries, fetchFinanceSummary } from "@/lib/api/finance";
import { fetchProjects } from "@/lib/api/projects";
import { fetchServices } from "@/lib/api/services";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildClientQuery } from "@/lib/clients/query";
import { buildContractQuery } from "@/lib/contracts/query";
import { buildFinanceQuery } from "@/lib/finance/query";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildServiceQuery } from "@/lib/services/query";
import type { FinanceSearchParams, FinanceSelectOption } from "@/lib/types/finance";

type FinancePageProps = {
  searchParams: Promise<FinanceSearchParams>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "FINANCE");
  const query = buildFinanceQuery(resolvedSearchParams);
  const [financePage, summary, clientPage, contractPage, projectPage, servicePage] = await Promise.all([
    fetchFinanceEntries(query),
    fetchFinanceSummary({ from: query.from, to: query.to }),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" })),
    fetchContracts(buildContractQuery({ size: "100", status: "ativo" })),
    fetchProjects(buildProjectQuery({ size: "100", active: "true" })),
    fetchServices(buildServiceQuery({ size: "100", active: "true" }))
  ]);
  const clientOptions = clientPage.content.map(toOption);
  const contractOptions = contractPage.content.map((contract) => ({
    id: contract.id,
    label: contract.plan
  }));
  const projectOptions = projectPage.content.map(toOption);
  const serviceOptions = servicePage.content.map(toOption);
  const loadError = financePage.loadError ?? summary.loadError ?? clientPage.loadError ?? contractPage.loadError ?? projectPage.loadError ?? servicePage.loadError;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Controle financeiro
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Financeiro
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Receitas, despesas, comissoes, impostos, centros de custo e
            previsao financeira com filtros por periodo.
          </p>
        </div>
        <PermissionGate module="FINANCE" level="write" role={user?.role ?? null}>
          <FinanceCreateButton
            clientOptions={clientOptions}
            contractOptions={contractOptions}
            projectOptions={projectOptions}
            serviceOptions={serviceOptions}
          />
        </PermissionGate>
      </section>

      <FinanceMetrics summary={summary} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <FinanceFilters query={query} />
        <FinanceTable
          financePage={financePage}
          clientOptions={clientOptions}
          contractOptions={contractOptions}
          projectOptions={projectOptions}
          serviceOptions={serviceOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toOption(entity: { id: string; name: string }): FinanceSelectOption {
  return { id: entity.id, label: entity.name };
}
