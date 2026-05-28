import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import type { BillingClient } from "@/lib/types/billing";

type ClientValueTableProps = {
  clients: BillingClient[];
};

export function ClientValueTable({ clients }: ClientValueTableProps) {
  const topClients = [...clients]
    .sort((first, second) => Number(second.totalValue ?? 0) - Number(first.totalValue ?? 0))
    .slice(0, 8);

  return (
    <section className="rounded-xl bg-panel/95 p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">Carteira</p>
          <h2 className="mt-1 text-lg font-bold text-white">Clientes de maior valor</h2>
        </div>
        <Link href="/billing" className="text-sm font-bold text-brand-400 hover:text-brand-300">Faturamento</Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line">
        {topClients.length ? topClients.map((client) => (
          <div key={client.clientId} className="grid gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_120px_120px]">
            <div>
              <p className="font-semibold text-white">{client.clientName}</p>
              <p className="mt-1 text-xs text-zinc-500">{client.months} meses contratados</p>
            </div>
            <div className="text-zinc-300">{formatCurrency(client.monthlyValue)}/mes</div>
            <div className="font-bold text-white">{formatCurrency(client.totalValue)}</div>
          </div>
        )) : (
          <div className="px-4 py-10 text-center text-sm text-muted">Nenhum cliente faturado no momento.</div>
        )}
      </div>
    </section>
  );
}
