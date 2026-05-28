import { BrandLogo } from "@/components/brand/brand-logo";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardHealth } from "@/components/dashboard/dashboard-health";
import { DashboardKpis } from "@/components/dashboard/dashboard-kpis";
import { MeetingsChart } from "@/components/dashboard/meetings-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { fetchDashboardMetrics, fetchMeetingsChart, fetchRevenueChart } from "@/lib/api/dashboard";
import { buildDashboardQuery } from "@/lib/dashboard/query";
import type { DashboardSearchParams } from "@/lib/types/dashboard";

type DashboardPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = buildDashboardQuery(resolvedSearchParams);
  const [metrics, revenueChart, meetingsChart] = await Promise.all([
    fetchDashboardMetrics(query),
    fetchRevenueChart(query),
    fetchMeetingsChart(query)
  ]);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <BrandLogo variant="mark" size="lg" priority className="mt-1 hidden md:inline-flex" />
          <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Visao executiva
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Dashboard Principal
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Receita, MRR, clientes, contratos, funil comercial e riscos
            operacionais em uma visao unica para tomada de decisao diaria.
          </p>
          </div>
        </div>
        <DashboardFilters query={query} />
      </section>

      {metrics.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar o dashboard real.
        </div>
      ) : null}

      <DashboardKpis metrics={metrics} />
      <DashboardHealth metrics={metrics} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <RevenueChart points={revenueChart} />
        <MeetingsChart points={meetingsChart} />
      </section>
    </main>
  );
}
