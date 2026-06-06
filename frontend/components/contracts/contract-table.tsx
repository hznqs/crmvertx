import { ContractRowActions } from "@/components/contracts/contract-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { contractStatusLabels, contractStatusTone } from "@/lib/contracts/labels";
import type { Contract, ContractPage, ContractSelectOption } from "@/lib/types/contracts";

type ContractTableProps = {
  contractPage: ContractPage;
  clientOptions: ContractSelectOption[];
  serviceOptions: ContractSelectOption[];
  projectOptions: ContractSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function ContractTable({
  contractPage,
  clientOptions,
  serviceOptions,
  projectOptions,
  actionPermissions
}: ContractTableProps) {
  if (contractPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum contrato encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre um contrato recorrente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Contrato</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Vigencia</th>
              <th className="px-5 py-4 font-bold">Mensalidade</th>
              <th className="px-5 py-4 font-bold">Resumo financeiro</th>
              <th className="px-5 py-4 font-bold">Renovacao</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {contractPage.content.map((contract) => (
              <ContractRow
                key={contract.id}
                contract={contract}
                clientOptions={clientOptions}
                serviceOptions={serviceOptions}
                projectOptions={projectOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {contractPage.number + 1} de {contractPage.totalPages}</span>
        <span>{contractPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function ContractRow({
  contract,
  clientOptions,
  serviceOptions,
  projectOptions,
  actionPermissions
}: {
  contract: Contract;
  clientOptions: ContractSelectOption[];
  serviceOptions: ContractSelectOption[];
  projectOptions: ContractSelectOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const clientLabel = clientOptions.find((client) => client.id === contract.clientId)?.label ?? "Sem cliente";
  const servicesLabel = contract.serviceItems?.length
    ? contract.serviceItems.map((item) => item.serviceName).join(", ")
    : serviceOptions.find((service) => service.id === contract.serviceId)?.label ?? "Sem servico";

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{contract.plan}</p>
          <p className="mt-1 text-xs text-zinc-500">{clientLabel}</p>
          <p className="mt-1 max-w-xs truncate text-xs text-brand-100/80">{servicesLabel}</p>
          <p className="mt-1 text-xs text-zinc-500">{contract.recurring ? "Recorrente para MRR/churn" : "Avulso, fora do churn"}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${contractStatusTone[contract.status]}`}>
          {contractStatusLabels[contract.status]}
        </span>
      </td>
      <td className="px-5 py-4 text-zinc-300">
        <div>{formatDate(contract.startDate)}</div>
        <div className="mt-1 text-xs text-zinc-500">ate {formatDate(contract.endDate)}</div>
      </td>
      <td className="px-5 py-4 font-semibold text-white">
        {formatCurrency(contract.monthlyValue)}
        {Number(contract.oneTimeServicesValue ?? 0) > 0 ? (
          <div className="mt-1 text-xs text-zinc-500">+ {formatCurrency(contract.oneTimeServicesValue)} avulso</div>
        ) : null}
        {Number(contract.mrrLost ?? 0) > 0 ? (
          <div className="mt-1 text-xs text-rose-200">MRR perdido {formatCurrency(contract.mrrLost)}</div>
        ) : null}
      </td>
      <td className="px-5 py-4 text-zinc-300">
        <div className="font-semibold text-white">{formatCurrency(contract.totalValue)}</div>
        <div className="mt-1 text-xs text-zinc-500">
          Impl. {formatCurrency(contract.implementationFee ?? 0)} · Desc. {formatCurrency(contract.discount ?? 0)}
        </div>
      </td>
      <td className="px-5 py-4 text-zinc-300">
        <div>{contract.autoRenew ? "Automatica" : "Manual"}</div>
        <div className="mt-1 text-xs text-zinc-500">dia {contract.billingDueDay ?? "-"}</div>
      </td>
      <td className="px-5 py-4">
        <ContractRowActions
          contract={contract}
          clientOptions={clientOptions}
          serviceOptions={serviceOptions}
          projectOptions={projectOptions}
          actionPermissions={actionPermissions}
        />
      </td>
    </tr>
  );
}
