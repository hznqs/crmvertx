import { MetricCard } from "@/components/app/metric-card";
import { EmptyState, PageHeader, Section } from "@/components/app/enterprise-page";
import { BillingClientTable } from "@/components/billing/billing-client-table";
import { BillingFilters } from "@/components/billing/billing-filters";
import { fetchBillingSummary } from "@/lib/api/billing";
import { formatCurrency } from "@/lib/formatters";

type BillingPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const resolvedSearchParams = await searchParams;
  const billing = await fetchBillingSummary(resolvedSearchParams);
  const loadError = billing.loadError;

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Receita"
        title="Faturamento"
        description="Resumo executivo de contratos ativos, MRR, ticket médio e concentração por cliente."
      />

      <BillingFilters />

      {loadError ? (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {loadError}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard tone="brand" label="Receita contratada" value={formatCurrency(billing.totalRevenue)} helper="Soma total dos contratos ativos" />
        <MetricCard tone="brand" label="MRR" value={formatCurrency(billing.mrr)} helper="Receita Recorrente Mensal" />
        <MetricCard label="Ticket médio" value={formatCurrency(billing.averageTicket)} helper="Média por contrato ativo" />
        <MetricCard label="Contratos ativos" value={String(billing.activeContracts)} helper="Base recorrente monitorada" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard tone="success" label="Receita Recebida" value={formatCurrency(billing.receivedRevenue)} helper="No período filtrado" />
        <MetricCard tone="warning" label="Receita Pendente" value={formatCurrency(billing.pendingRevenue)} helper="No período filtrado" />
        <MetricCard tone="danger" label="Receita Atrasada" value={formatCurrency(billing.overdueRevenue)} helper="No período filtrado" />
      </section>

      <Section title="Clientes por valor" description="Ranking financeiro para priorizar retenção, expansão e acompanhamento de contas.">
        {billing.clients.length ? (
          <BillingClientTable clients={billing.clients} />
        ) : (
          <EmptyState title="Nenhum contrato ativo encontrado" description="Quando contratos ativos entrarem na carteira, o ranking financeiro aparece aqui automaticamente." />
        )}
      </Section>
    </main>
  );
}
