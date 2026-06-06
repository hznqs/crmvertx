import { PermissionGate } from "@/components/auth/permission-gate";
import { DeliveryCreateButton } from "@/components/deliveries/delivery-create-button";
import { DeliveryFilters } from "@/components/deliveries/delivery-filters";
import { DeliveryKanbanAnalytics } from "@/components/deliveries/delivery-kanban-analytics";
import { DeliveryKanbanBoard } from "@/components/deliveries/delivery-kanban-board";
import { DeliveryMetrics } from "@/components/deliveries/delivery-metrics";
import { DeliveryTable } from "@/components/deliveries/delivery-table";
import { fetchClients } from "@/lib/api/clients";
import { fetchContracts } from "@/lib/api/contracts";
import { fetchDeliveries, fetchDeliverySummary } from "@/lib/api/deliveries";
import { fetchProjects } from "@/lib/api/projects";
import { fetchServices } from "@/lib/api/services";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildClientQuery } from "@/lib/clients/query";
import { buildContractQuery } from "@/lib/contracts/query";
import { buildDeliveryQuery } from "@/lib/deliveries/query";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildServiceQuery } from "@/lib/services/query";
import type { DeliverySearchParams, DeliverySelectOption } from "@/lib/types/deliveries";

type DeliveriesPageProps = {
  searchParams: Promise<DeliverySearchParams>;
};

export default async function DeliveriesPage({ searchParams }: DeliveriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "DELIVERIES");
  const query = buildDeliveryQuery(resolvedSearchParams);
  const [deliveryPage, summary, clientPage, projectPage, contractPage, servicePage] = await Promise.all([
    fetchDeliveries(query),
    fetchDeliverySummary({ clientId: query.clientId, owner: query.owner }),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" })),
    fetchProjects(buildProjectQuery({ size: "100", active: "true" })),
    fetchContracts(buildContractQuery({ size: "100", status: "ativo" })),
    fetchServices(buildServiceQuery({ size: "100", active: "true" }))
  ]);
  const clientOptions = clientPage.content.map(toOption);
  const projectOptions = projectPage.content.map(toOption);
  const contractOptions = contractPage.content.map((contract) => ({
    id: contract.id,
    label: contract.plan
  }));
  const serviceOptions = servicePage.content.map(toOption);
  const loadError = deliveryPage.loadError ?? summary.loadError ?? clientPage.loadError ?? projectPage.loadError ?? contractPage.loadError ?? servicePage.loadError;

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Pipeline operacional
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Entregas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Controle de entregas por cliente, projeto, contrato, servico,
            responsavel e prazo para proteger SLA e aprovacoes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PermissionGate module="DELIVERIES" level="write" role={user?.role ?? null}>
            <DeliveryCreateButton
              clientOptions={clientOptions}
              projectOptions={projectOptions}
              contractOptions={contractOptions}
              serviceOptions={serviceOptions}
            />
          </PermissionGate>
        </div>
      </section>

      <DeliveryMetrics summary={summary} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <DeliveryFilters query={query} clientOptions={clientOptions} />
        <DeliveryTable
          deliveryPage={deliveryPage}
          clientOptions={clientOptions}
          projectOptions={projectOptions}
          contractOptions={contractOptions}
          serviceOptions={serviceOptions}
          actionPermissions={actionPermissions}
        />
      </section>

      <section className="space-y-4 rounded-xl bg-panel/95 p-4 shadow-panel md:p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-400">
            Visual operacional
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            Kanban de entregas
          </h2>
        </div>
        <DeliveryKanbanAnalytics deliveries={deliveryPage.content} />
        <DeliveryKanbanBoard deliveries={deliveryPage.content} clientOptions={clientOptions} />
      </section>
    </main>
  );
}

function toOption(entity: { id: string; name: string }): DeliverySelectOption {
  return { id: entity.id, label: entity.name };
}
