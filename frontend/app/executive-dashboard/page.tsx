import { ClientValueTable } from "@/components/executive-dashboard/client-value-table";
import { ExecutiveComposition } from "@/components/executive-dashboard/executive-composition";
import { ExecutiveKpis } from "@/components/executive-dashboard/executive-kpis";
import { ExecutiveRisk } from "@/components/executive-dashboard/executive-risk";
import { fetchBillingSummary } from "@/lib/api/billing";
import { fetchDashboardMetrics } from "@/lib/api/dashboard";
import { fetchFinanceSummary } from "@/lib/api/finance";

export default async function ExecutiveDashboardPage() {
  const [billing, dashboard, finance] = await Promise.all([
    fetchBillingSummary(),
    fetchDashboardMetrics({ from: "", to: "" }),
    fetchFinanceSummary({ from: "", to: "" })
  ]);

  return (
    <main className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
          Dashboard executivo
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Visao de lucro e crescimento
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Receita contratada, MRR, lucro estimado, margem, riscos de churn e
          clientes de maior valor para decisao estrategica.
        </p>
      </section>

      {billing.sourceUnavailable || dashboard.sourceUnavailable || finance.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar o dashboard executivo real.
        </div>
      ) : null}

      <ExecutiveKpis billing={billing} dashboard={dashboard} finance={finance} />
      <ExecutiveRisk dashboard={dashboard} finance={finance} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <ClientValueTable clients={billing.clients} />
        <ExecutiveComposition finance={finance} />
      </section>
    </main>
  );
}
