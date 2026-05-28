import { PerformanceRowActions } from "@/components/performance/performance-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { ClientPerformanceRecord, PerformanceClientOption, PerformancePage } from "@/lib/types/performance";

type PerformanceTableProps = {
  performancePage: PerformancePage;
  clientOptions: PerformanceClientOption[];
  actionPermissions: ModuleActionPermissions;
};

export function PerformanceTable({ performancePage, clientOptions, actionPermissions }: PerformanceTableProps) {
  if (performancePage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum registro encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre uma performance de cliente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Cliente</th>
              <th className="px-5 py-4 font-bold">Data</th>
              <th className="px-5 py-4 font-bold">Leads</th>
              <th className="px-5 py-4 font-bold">CPL</th>
              <th className="px-5 py-4 font-bold">Conversao</th>
              <th className="px-5 py-4 font-bold">ROI</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {performancePage.content.map((record) => (
              <PerformanceRow
                key={record.id}
                record={record}
                clientOptions={clientOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {performancePage.number + 1} de {performancePage.totalPages}</span>
        <span>{performancePage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function PerformanceRow({
  record,
  clientOptions,
  actionPermissions
}: {
  record: ClientPerformanceRecord;
  clientOptions: PerformanceClientOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const clientLabel = clientOptions.find((client) => client.id === record.clientId)?.label ?? "Sem cliente";

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <p className="font-semibold text-white">{clientLabel}</p>
        <p className="mt-1 text-xs text-zinc-500">{formatCurrency(record.revenue)} receita · {formatCurrency(record.investment)} investido</p>
      </td>
      <td className="px-5 py-4 text-zinc-300">{formatDate(record.date)}</td>
      <td className="px-5 py-4 text-zinc-300">{record.leads} leads · {record.sales} vendas</td>
      <td className="px-5 py-4 text-zinc-300">{formatCurrency(record.cpl)}</td>
      <td className="px-5 py-4 font-semibold text-white">{Number(record.conversionRate ?? 0).toFixed(1)}%</td>
      <td className="px-5 py-4 font-semibold text-emerald-100">{Number(record.roi ?? 0).toFixed(1)}%</td>
      <td className="px-5 py-4">
        <PerformanceRowActions
          record={record}
          clientOptions={clientOptions}
          actionPermissions={actionPermissions}
        />
      </td>
    </tr>
  );
}
