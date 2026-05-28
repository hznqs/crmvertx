import { PermissionGate } from "@/components/auth/permission-gate";
import { ContractCreateButton } from "@/components/contracts/contract-create-button";
import { ContractFilters } from "@/components/contracts/contract-filters";
import { ContractMetrics } from "@/components/contracts/contract-metrics";
import { ContractTable } from "@/components/contracts/contract-table";
import { fetchClients } from "@/lib/api/clients";
import { fetchContracts, fetchContractSummary } from "@/lib/api/contracts";
import { fetchProjects } from "@/lib/api/projects";
import { fetchServices } from "@/lib/api/services";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildClientQuery } from "@/lib/clients/query";
import { buildContractQuery } from "@/lib/contracts/query";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildServiceQuery } from "@/lib/services/query";
import type { ContractSearchParams, ContractSelectOption } from "@/lib/types/contracts";

type ContractsPageProps = {
  searchParams: Promise<ContractSearchParams>;
};

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "CONTRACTS");
  const query = buildContractQuery(resolvedSearchParams);
  const [contractPage, summary, clientPage, servicePage, projectPage] = await Promise.all([
    fetchContracts(query),
    fetchContractSummary(),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" })),
    fetchServices(buildServiceQuery({ size: "100", active: "true" })),
    fetchProjects(buildProjectQuery({ size: "100", active: "true" }))
  ]);
  const clientOptions = clientPage.content.map(toOption);
  const serviceOptions = servicePage.content.map(toOption);
  const projectOptions = projectPage.content.map(toOption);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Receita recorrente
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Contratos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Gestao de vigencia, renovacao, vencimento e valores para contratos
            mensais, avulsos e recorrentes.
          </p>
        </div>
        <PermissionGate module="CONTRACTS" level="write" role={user?.role ?? null}>
          <ContractCreateButton clientOptions={clientOptions} serviceOptions={serviceOptions} projectOptions={projectOptions} />
        </PermissionGate>
      </section>

      <ContractMetrics contracts={contractPage.content} summary={summary} />

      {contractPage.sourceUnavailable || summary.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar contratos e resumo financeiro reais.
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <ContractFilters query={query} clientOptions={clientOptions} />
        <ContractTable
          contractPage={contractPage}
          clientOptions={clientOptions}
          serviceOptions={serviceOptions}
          projectOptions={projectOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toOption(entity: { id: string; name?: string; plan?: string }): ContractSelectOption {
  return { id: entity.id, label: entity.name ?? entity.plan ?? entity.id.slice(0, 8) };
}
