import { PermissionGate } from "@/components/auth/permission-gate";
import { PerformanceCreateButton } from "@/components/performance/performance-create-button";
import { PerformanceFilters } from "@/components/performance/performance-filters";
import { PerformanceMetrics } from "@/components/performance/performance-metrics";
import { PerformanceTable } from "@/components/performance/performance-table";
import { fetchClients } from "@/lib/api/clients";
import { fetchPerformanceRecords } from "@/lib/api/performance";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildClientQuery } from "@/lib/clients/query";
import { buildPerformanceQuery } from "@/lib/performance/query";
import type { PerformanceClientOption, PerformanceSearchParams } from "@/lib/types/performance";

type PerformancePageProps = {
  searchParams: Promise<PerformanceSearchParams>;
};

export default async function PerformancePage({ searchParams }: PerformancePageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "PERFORMANCE");
  const query = buildPerformanceQuery(resolvedSearchParams);
  const [performancePage, clientPage] = await Promise.all([
    fetchPerformanceRecords(query),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" }))
  ]);
  const clientOptions = clientPage.content.map(toClientOption);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Marketing e ROI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Performance Cliente
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            ROI, CPL, conversao, leads gerados, vendas, receita e investimento
            por cliente com calculos definitivos no backend.
          </p>
        </div>
        <PermissionGate module="PERFORMANCE" level="write" role={user?.role ?? null}>
          <PerformanceCreateButton clientOptions={clientOptions} />
        </PermissionGate>
      </section>

      <PerformanceMetrics records={performancePage.content} totalElements={performancePage.totalElements} />

      {performancePage.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar a performance real.
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <PerformanceFilters query={query} clientOptions={clientOptions} />
        <PerformanceTable
          performancePage={performancePage}
          clientOptions={clientOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toClientOption(client: { id: string; name: string }): PerformanceClientOption {
  return { id: client.id, label: client.name };
}
