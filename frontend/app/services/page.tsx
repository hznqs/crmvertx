import { PermissionGate } from "@/components/auth/permission-gate";
import { ServiceCreateButton } from "@/components/services/service-create-button";
import { ServiceFilters } from "@/components/services/service-filters";
import { ServiceMetrics } from "@/components/services/service-metrics";
import { ServiceTable } from "@/components/services/service-table";
import { fetchServices } from "@/lib/api/services";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildServiceQuery } from "@/lib/services/query";
import type { ServiceSearchParams } from "@/lib/types/services";

type ServicesPageProps = {
  searchParams: Promise<ServiceSearchParams>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "SERVICES");
  const query = buildServiceQuery(resolvedSearchParams);
  const servicePage = await fetchServices(query);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Catalogo comercial
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Servicos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Ofertas vendaveis com precificacao, SLA, checklist, etapas, margem
            e comissao para conectar vendas, projetos e financeiro.
          </p>
        </div>
        <PermissionGate module="SERVICES" level="write" role={user?.role ?? null}>
          <ServiceCreateButton />
        </PermissionGate>
      </section>

      <ServiceMetrics services={servicePage.content} totalElements={servicePage.totalElements} />

      {servicePage.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar o catalogo real de servicos.
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <ServiceFilters query={query} />
        <ServiceTable servicePage={servicePage} actionPermissions={actionPermissions} />
      </section>
    </main>
  );
}
