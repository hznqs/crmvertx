import { formatCurrency } from "@/lib/formatters";
import type { FinanceSummary } from "@/lib/types/finance";

type ExecutiveCompositionProps = {
  finance: FinanceSummary;
};

export function ExecutiveComposition({ finance }: ExecutiveCompositionProps) {
  const grossRevenue = Number(finance.grossRevenue ?? 0);
  const items = [
    { label: "Despesas", value: Number(finance.expenses ?? 0), tone: "bg-rose-400" },
    { label: "Comissoes", value: Number(finance.commissions ?? 0), tone: "bg-amber-400" },
    { label: "Impostos", value: Number(finance.taxes ?? 0), tone: "bg-sky-400" },
    { label: "Lucro", value: Number(finance.netProfit ?? 0), tone: "bg-emerald-400" }
  ];

  return (
    <section className="rounded-xl bg-panel/95 p-5 shadow-panel">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">Composicao</p>
        <h2 className="mt-1 text-lg font-bold text-white">Margem e custos</h2>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const width = grossRevenue > 0 ? Math.min(Math.abs(item.value / grossRevenue) * 100, 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">{item.label}</span>
                <span className="text-zinc-500">{formatCurrency(item.value)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
