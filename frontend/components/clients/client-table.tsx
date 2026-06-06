import { ClientRowActions } from "@/components/clients/client-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { clientPriorityLabels, clientStatusLabels } from "@/lib/clients/labels";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Client, ClientPage } from "@/lib/types/clients";

type ClientTableProps = {
  clientPage: ClientPage;
  actionPermissions: ModuleActionPermissions;
};

export function ClientTable({ clientPage, actionPermissions }: ClientTableProps) {
  if (clientPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum cliente encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre um novo cliente.</p>
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
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Prioridade</th>
              <th className="px-5 py-4 font-bold">Origem</th>
              <th className="px-5 py-4 font-bold">Recorrencia</th>
              <th className="px-5 py-4 font-bold">Criado em</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {clientPage.content.map((client) => (
              <ClientRow key={client.id} client={client} actionPermissions={actionPermissions} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {clientPage.number + 1} de {clientPage.totalPages}</span>
        <span>{clientPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function ClientRow({
  client,
  actionPermissions
}: {
  client: Client;
  actionPermissions: ModuleActionPermissions;
}) {
  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{client.name}</p>
          <p className="mt-1 text-xs text-zinc-500">{client.contact} · {client.email || client.phone || "Sem contato"}</p>
        </div>
      </td>
      <td className="px-5 py-4"><Badge>{client.status ? clientStatusLabels[client.status] : "-"}</Badge></td>
      <td className="px-5 py-4"><Badge>{client.priority ? clientPriorityLabels[client.priority] : "-"}</Badge></td>
      <td className="px-5 py-4 text-zinc-300">{client.origin ?? client.segment ?? "-"}</td>
      <td className="px-5 py-4">
        {client.hasActiveContracts ? (
          <div>
            <Badge>Contrato ativo</Badge>
            <p className="mt-1 text-xs text-zinc-500">MRR {formatCurrency(client.currentMrr ?? 0)}</p>
          </div>
        ) : (
          <span className="text-xs font-semibold text-zinc-500">{client.hasContractHistory ? "Historico arquivado" : "Sem contrato"}</span>
        )}
      </td>
      <td className="px-5 py-4 text-zinc-400">{formatDate(client.createdAt)}</td>
      <td className="px-5 py-4"><ClientRowActions client={client} actionPermissions={actionPermissions} /></td>
    </tr>
  );
}

function Badge({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="inline-flex rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-200">{children}</span>;
}
