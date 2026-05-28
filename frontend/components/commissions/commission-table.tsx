import { CommissionRowActions } from "@/components/commissions/commission-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { commissionStatusLabels, commissionStatusTone, commissionTypeLabels } from "@/lib/commissions/labels";
import type { CommissionPage, CommissionSale, CommissionSelectOption } from "@/lib/types/commissions";

type CommissionTableProps = {
  commissionPage: CommissionPage;
  memberOptions: CommissionSelectOption[];
  contractOptions: CommissionSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function CommissionTable({ commissionPage, memberOptions, contractOptions, actionPermissions }: CommissionTableProps) {
  if (commissionPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhuma comissao encontrada</p>
        <p className="mt-2 text-sm text-muted">Ajuste o filtro ou cadastre uma nova comissao.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Comissao</th>
              <th className="px-5 py-4 font-bold">Tipo</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Venda</th>
              <th className="px-5 py-4 font-bold">Comissao</th>
              <th className="px-5 py-4 font-bold">Pagamento</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {commissionPage.content.map((commission) => (
              <CommissionRow
                key={commission.id}
                commission={commission}
                memberOptions={memberOptions}
                contractOptions={contractOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {commissionPage.number + 1} de {commissionPage.totalPages}</span>
        <span>{commissionPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function CommissionRow({
  commission,
  memberOptions,
  contractOptions,
  actionPermissions
}: {
  commission: CommissionSale;
  memberOptions: CommissionSelectOption[];
  contractOptions: CommissionSelectOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const memberLabel = memberOptions.find((member) => member.id === commission.memberId)?.label ?? commission.memberId.slice(0, 8);

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{memberLabel}</p>
          <p className="mt-1 text-xs text-zinc-500">{commission.client || "Sem cliente"}</p>
        </div>
      </td>
      <td className="px-5 py-4 text-zinc-300">{commissionTypeLabels[commission.type]}</td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${commissionStatusTone[commission.status]}`}>
          {commissionStatusLabels[commission.status]}
        </span>
      </td>
      <td className="px-5 py-4 text-zinc-300">{formatCurrency(commission.value)}</td>
      <td className="px-5 py-4 font-semibold text-white">{formatCurrency(commission.commissionValue)}</td>
      <td className="px-5 py-4 text-zinc-300">{formatDate(commission.paidAt)}</td>
      <td className="px-5 py-4">
        <CommissionRowActions
          commission={commission}
          memberOptions={memberOptions}
          contractOptions={contractOptions}
          actionPermissions={actionPermissions}
        />
      </td>
    </tr>
  );
}
