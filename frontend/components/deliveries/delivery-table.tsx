import { DeliveryRowActions } from "@/components/deliveries/delivery-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/formatters";
import { deliveryStatusLabels, deliveryStatusTone } from "@/lib/deliveries/labels";
import type { Delivery, DeliveryPage, DeliverySelectOption } from "@/lib/types/deliveries";

type DeliveryTableProps = {
  deliveryPage: DeliveryPage;
  clientOptions: DeliverySelectOption[];
  projectOptions: DeliverySelectOption[];
  contractOptions: DeliverySelectOption[];
  serviceOptions: DeliverySelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function DeliveryTable({
  deliveryPage,
  clientOptions,
  projectOptions,
  contractOptions,
  serviceOptions,
  actionPermissions
}: DeliveryTableProps) {
  if (deliveryPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhuma entrega encontrada</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre uma nova entrega operacional.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Entrega</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Responsavel</th>
              <th className="px-5 py-4 font-bold">Prazo</th>
              <th className="px-5 py-4 font-bold">Cliente</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {deliveryPage.content.map((delivery) => (
              <DeliveryRow
                key={delivery.id}
                delivery={delivery}
                clientOptions={clientOptions}
                projectOptions={projectOptions}
                contractOptions={contractOptions}
                serviceOptions={serviceOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {deliveryPage.number + 1} de {deliveryPage.totalPages}</span>
        <span>{deliveryPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function DeliveryRow({
  delivery,
  clientOptions,
  projectOptions,
  contractOptions,
  serviceOptions,
  actionPermissions
}: {
  delivery: Delivery;
  clientOptions: DeliverySelectOption[];
  projectOptions: DeliverySelectOption[];
  contractOptions: DeliverySelectOption[];
  serviceOptions: DeliverySelectOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const clientLabel = clientOptions.find((client) => client.id === delivery.clientId)?.label ?? "Sem cliente";

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-72">
          <p className="font-semibold text-white">{delivery.title}</p>
          <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{delivery.type} · {delivery.description || "Sem descricao"}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${deliveryStatusTone[delivery.status]}`}>
          {deliveryStatusLabels[delivery.status]}
        </span>
      </td>
      <td className="px-5 py-4 text-zinc-300">{delivery.owner}</td>
      <td className="px-5 py-4">
        <div className="text-zinc-300">{formatDate(delivery.deadline)}</div>
        {isLate(delivery) ? <div className="mt-1 text-xs font-bold text-rose-200">Atrasada</div> : null}
      </td>
      <td className="px-5 py-4 text-zinc-300">{clientLabel}</td>
      <td className="px-5 py-4">
        <DeliveryRowActions
          delivery={delivery}
          clientOptions={clientOptions}
          projectOptions={projectOptions}
          contractOptions={contractOptions}
          serviceOptions={serviceOptions}
          actionPermissions={actionPermissions}
        />
      </td>
    </tr>
  );
}

function isLate(delivery: Delivery) {
  if (delivery.status === "aprovado") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(delivery.deadline) < today;
}
