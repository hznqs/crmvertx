import { PermissionGate } from "@/components/auth/permission-gate";
import { ClientCreateButton } from "@/components/clients/client-create-button";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientMetrics } from "@/components/clients/client-metrics";
import { ClientTable } from "@/components/clients/client-table";
import { fetchClients } from "@/lib/api/clients";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildClientQuery } from "@/lib/clients/query";
import type { ClientSearchParams } from "@/lib/types/clients";

type ClientsPageProps = {
  searchParams: Promise<ClientSearchParams>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "CLIENTS");
  const query = buildClientQuery(resolvedSearchParams);
  const clientPage = await fetchClients(query);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Relacionamento
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Clientes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Base de clientes com status, prioridade, contrato, contato,
            endereco e historico operacional.
          </p>
        </div>
        <PermissionGate module="CLIENTS" level="write" role={user?.role ?? null}>
          <ClientCreateButton />
        </PermissionGate>
      </section>

      <ClientMetrics clients={clientPage.content} totalElements={clientPage.totalElements} />

      {clientPage.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar os clientes reais.
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <ClientFilters query={query} />
        <ClientTable clientPage={clientPage} actionPermissions={actionPermissions} />
      </section>
    </main>
  );
}
