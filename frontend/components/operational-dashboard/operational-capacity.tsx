import Link from "next/link";
import type { DeliverySummary } from "@/lib/types/deliveries";
import type { TeamSummary } from "@/lib/types/team";

type OperationalCapacityProps = {
  deliverySummary: DeliverySummary;
  teamSummary: TeamSummary;
};

export function OperationalCapacity({ deliverySummary, teamSummary }: OperationalCapacityProps) {
  const deliveryTotal = deliverySummary.pending + deliverySummary.production + deliverySummary.review + deliverySummary.approved;
  const deliveryItems = [
    { label: "Pendente", value: deliverySummary.pending },
    { label: "Producao", value: deliverySummary.production },
    { label: "Revisao", value: deliverySummary.review },
    { label: "Aprovado", value: deliverySummary.approved }
  ];

  return (
    <section className="rounded-xl bg-panel/95 p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white">Capacidade e entregas</h2>
        <Link href="/deliveries" className="text-sm font-bold text-brand-400 hover:text-brand-300">Abrir</Link>
      </div>

      <div className="mt-5 space-y-4">
        {deliveryItems.map((item) => {
          const percent = deliveryTotal > 0 ? Math.round((item.value / deliveryTotal) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-300">{item.label}</span>
                <span className="text-zinc-500">{item.value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand-400" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Equipe" value={teamSummary.total} />
        <MiniStat label="Marketing" value={teamSummary.marketing + teamSummary.traffic} />
        <MiniStat label="Dev" value={teamSummary.developer} />
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.035] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
