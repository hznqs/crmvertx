import { FinanceRowActions } from "@/components/finance/finance-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  costCenterLabels,
  financeStatusLabels,
  financeStatusTone,
  financeTypeLabels,
  financeTypeTone
} from "@/lib/finance/labels";
import type { FinanceEntry, FinanceEntryPage, FinanceSelectOption } from "@/lib/types/finance";

type FinanceTableProps = {
  financePage: FinanceEntryPage;
  clientOptions: FinanceSelectOption[];
  contractOptions: FinanceSelectOption[];
  projectOptions: FinanceSelectOption[];
  serviceOptions: FinanceSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function FinanceTable({
  financePage,
  clientOptions,
  contractOptions,
  projectOptions,
  serviceOptions,
  actionPermissions
}: FinanceTableProps) {
  if (financePage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum lancamento encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre uma receita/despesa.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Lancamento</th>
              <th className="px-5 py-4 font-bold">Tipo</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Valor</th>
              <th className="px-5 py-4 font-bold">Vencimento</th>
              <th className="px-5 py-4 font-bold">Centro</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {financePage.content.map((entry) => (
              <FinanceRow
                key={entry.id}
                entry={entry}
                clientOptions={clientOptions}
                contractOptions={contractOptions}
                projectOptions={projectOptions}
                serviceOptions={serviceOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {financePage.number + 1} de {financePage.totalPages}</span>
        <span>{financePage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function FinanceRow({
  entry,
  clientOptions,
  contractOptions,
  projectOptions,
  serviceOptions,
  actionPermissions
}: {
  entry: FinanceEntry;
  clientOptions: FinanceSelectOption[];
  contractOptions: FinanceSelectOption[];
  projectOptions: FinanceSelectOption[];
  serviceOptions: FinanceSelectOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const amountClassName = entry.type === "receita" ? "text-emerald-100" : "text-rose-100";

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{entry.description}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {entry.recurring ? "Recorrente" : "Unico"} {entry.autoBilling ? "com auto cobranca" : ""}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${financeTypeTone[entry.type]}`}>
          {financeTypeLabels[entry.type]}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${financeStatusTone[entry.status]}`}>
          {financeStatusLabels[entry.status]}
        </span>
      </td>
      <td className={`px-5 py-4 font-semibold ${amountClassName}`}>{formatCurrency(entry.value)}</td>
      <td className="px-5 py-4 text-zinc-300">{formatDate(entry.due)}</td>
      <td className="px-5 py-4 text-zinc-300">{costCenterLabels[entry.costCenter]}</td>
      <td className="px-5 py-4">
        <FinanceRowActions
          entry={entry}
          clientOptions={clientOptions}
          contractOptions={contractOptions}
          projectOptions={projectOptions}
          serviceOptions={serviceOptions}
          actionPermissions={actionPermissions}
        />
      </td>
    </tr>
  );
}
