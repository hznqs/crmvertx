import { ServiceRowActions } from "@/components/services/service-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { serviceBillingTypeLabels, serviceCategoryLabels } from "@/lib/services/labels";
import { formatCurrency } from "@/lib/formatters";
import type { ServiceOffering, ServicePage } from "@/lib/types/services";

type ServiceTableProps = {
  servicePage: ServicePage;
  actionPermissions: ModuleActionPermissions;
};

export function ServiceTable({ servicePage, actionPermissions }: ServiceTableProps) {
  if (servicePage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum servico encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre uma nova oferta.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Servico</th>
              <th className="px-5 py-4 font-bold">Categoria</th>
              <th className="px-5 py-4 font-bold">Cobranca</th>
              <th className="px-5 py-4 font-bold">Preco</th>
              <th className="px-5 py-4 font-bold">SLA</th>
              <th className="px-5 py-4 font-bold">Margem</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {servicePage.content.map((service) => (
              <ServiceRow key={service.id} service={service} actionPermissions={actionPermissions} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {servicePage.number + 1} de {servicePage.totalPages}</span>
        <span>{servicePage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function ServiceRow({
  service,
  actionPermissions
}: {
  service: ServiceOffering;
  actionPermissions: ModuleActionPermissions;
}) {
  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{service.name}</p>
          <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{service.description || "Sem descricao"}</p>
        </div>
      </td>
      <td className="px-5 py-4"><Badge>{serviceCategoryLabels[service.category]}</Badge></td>
      <td className="px-5 py-4"><Badge>{serviceBillingTypeLabels[service.billingType]}</Badge></td>
      <td className="px-5 py-4 font-semibold text-white">{formatCurrency(service.basePrice)}</td>
      <td className="px-5 py-4 text-zinc-300">{service.slaDays} dias</td>
      <td className="px-5 py-4 text-zinc-300">{service.grossMarginPercentage}%</td>
      <td className="px-5 py-4"><ServiceRowActions service={service} actionPermissions={actionPermissions} /></td>
    </tr>
  );
}

function Badge({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="inline-flex rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-200">{children}</span>;
}
