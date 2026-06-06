import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadCreateButton } from "@/components/leads/lead-create-button";
import { LeadMetrics } from "@/components/leads/lead-metrics";
import { LeadTable } from "@/components/leads/lead-table";
import { PermissionGate } from "@/components/auth/permission-gate";
import { fetchLeads } from "@/lib/api/leads";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildLeadQuery } from "@/lib/leads/query";
import type { LeadSearchParams } from "@/lib/types/leads";

type LeadPageProps = {
  searchParams: Promise<LeadSearchParams>;
};

export default async function LeadsPage({ searchParams }: LeadPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "LEADS");
  const query = buildLeadQuery(resolvedSearchParams);
  const leadPage = await fetchLeads(query);
  const loadError = leadPage.loadError;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Modulo comercial
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Leads
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Operacao comercial com filtros server-side, metricas do funil e
            visao de oportunidades pronta para evoluir para kanban.
          </p>
        </div>
        <PermissionGate module="LEADS" level="write" role={user?.role ?? null}>
          <LeadCreateButton />
        </PermissionGate>
      </section>

      <LeadMetrics leads={leadPage.content} totalElements={leadPage.totalElements} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <LeadFilters query={query} />
        <LeadTable leadPage={leadPage} actionPermissions={actionPermissions} />
      </section>
    </main>
  );
}
