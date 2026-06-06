import { MetricCard } from "@/components/app/metric-card";
import { PageHeader, Section } from "@/components/app/enterprise-page";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { MeetingsChart } from "@/components/dashboard/meetings-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart";
import { 
  fetchDashboardMetrics, 
  fetchMeetingsChart, 
  fetchRevenueChart,
  fetchPipelineFunnel,
  fetchLeadsOrigin,
  fetchTopServices,
  fetchProjectsStatus
} from "@/lib/api/dashboard";
import { buildDashboardQuery } from "@/lib/dashboard/query";
import type { DashboardSearchParams } from "@/lib/types/dashboard";
import { formatCurrency } from "@/lib/formatters";
import { chartColors } from "@/lib/theme/chart";

type AnalyticsPageProps = {
  searchParams: Promise<DashboardSearchParams>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = buildDashboardQuery(resolvedSearchParams);

  const [
    metrics, 
    revenue, 
    meetings,
    pipelineFunnel,
    leadsOrigin,
    topServices,
    projectsStatus
  ] = await Promise.all([
    fetchDashboardMetrics(query),
    fetchRevenueChart(query),
    fetchMeetingsChart(query),
    fetchPipelineFunnel(query),
    fetchLeadsOrigin(query),
    fetchTopServices(query),
    fetchProjectsStatus(query)
  ]);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <PageHeader
          eyebrow="Relatorios"
          title="Graficos"
          description="Visao de receita, contratos, clientes ativos, metas e funil ao longo do tempo."
        />
        <DashboardFilters query={query} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard tone="brand" label="Receita anual" value={formatCurrency(metrics.monthlyRevenue)} helper={`${revenue.length} pontos de serie`} />
        <MetricCard tone="success" label="Lucro liquido" value={formatCurrency(metrics.netProfit)} helper={`${Number(metrics.profitMargin ?? 0).toFixed(1)}% margem`} />
        <MetricCard tone="warning" label="Conversao" value={`${Number(metrics.conversionRate ?? 0).toFixed(1)}%`} helper={`${meetings.length} pontos comerciais`} />
        <MetricCard tone="danger" label="Risco operacional" value={`${Number(metrics.operationalRiskRate ?? 0).toFixed(1)}%`} helper={`${metrics.lateTasks} tarefas atrasadas`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <RevenueChart points={revenue} />
        <MeetingsChart points={meetings} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <AnalyticsBarChart title="Funil de Vendas" subtitle="Pipeline" points={pipelineFunnel} color={chartColors.brand} />
        <AnalyticsBarChart title="Origem de Leads" subtitle="Aquisicao" points={leadsOrigin} color={chartColors.primary} />
        <AnalyticsBarChart title="Servicos mais vendidos" subtitle="Planos" points={topServices} color={chartColors.success} />
        <AnalyticsBarChart title="Status de Projetos" subtitle="Operacao" points={projectsStatus} color={chartColors.warning} />
      </section>

      <Section title="Sinais de performance">
        <div className="grid gap-4 lg:grid-cols-3">
          <Signal title="Receita e MRR" value={formatCurrency(metrics.mrr)} helper="Base recorrente mensal monitorada" />
          <Signal title="Operacao" value={`${metrics.projectsAtRisk} projetos`} helper="Projetos em risco precisam de acao" />
          <Signal title="Carteira" value={`${metrics.activeClients} ativos`} helper={`${metrics.lostClients} clientes perdidos no periodo`} />
        </div>
      </Section>
    </main>
  );
}

function Signal({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <article className="rounded-lg border border-line bg-white/[0.025] p-4">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-muted">{helper}</p>
    </article>
  );
}
