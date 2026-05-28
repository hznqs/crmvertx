import type { DashboardMetrics } from "@/lib/types/dashboard";
import type { FinanceSummary } from "@/lib/types/finance";

type ExecutiveRiskProps = {
  dashboard: DashboardMetrics;
  finance: FinanceSummary;
};

export function ExecutiveRisk({ dashboard, finance }: ExecutiveRiskProps) {
  const risks = [
    { label: "Contratos vencendo", value: dashboard.contractsExpiring, helper: "Risco de renovacao" },
    { label: "Clientes perdidos", value: dashboard.lostClients, helper: "Churn historico" },
    { label: "Projetos em risco", value: dashboard.projectsAtRisk, helper: "SLA e margem" },
    { label: "Inadimplencia", value: formatMoneyLike(finance.overdue), helper: "Financeiro vencido" }
  ];

  return (
    <section className="rounded-xl bg-panel/95 p-5 shadow-panel">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">Riscos executivos</p>
        <h2 className="mt-1 text-lg font-bold text-white">Pontos de atencao</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {risks.map((risk) => (
          <article key={risk.label} className="rounded-xl border border-line bg-white/[0.025] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{risk.label}</p>
            <p className="mt-3 text-2xl font-bold text-white">{risk.value}</p>
            <p className="mt-2 text-sm text-muted">{risk.helper}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatMoneyLike(value: number | string) {
  return `R$ ${Number(value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}
