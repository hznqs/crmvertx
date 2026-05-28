import { MetricCard } from "@/components/app/metric-card";
import { EmptyState, PageHeader, Section } from "@/components/app/enterprise-page";
import { BillingClientTable } from "@/components/billing/billing-client-table";
import { fetchBillingSummary } from "@/lib/api/billing";
import { formatCurrency } from "@/lib/formatters";

export default async function BillingPage() {
  const billing = await fetchBillingSummary();

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Receita"
        title="Faturamento"
        description="Resumo executivo de contratos ativos, receita contratada, ticket medio e concentracao por cliente."
      />

      {billing.sourceUnavailable ? (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Backend indisponivel. Os indicadores aparecem zerados ate a API responder.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Receita contratada" value={formatCurrency(billing.totalRevenue)} helper="Soma da carteira ativa" />
        <MetricCard label="Ticket medio" value={formatCurrency(billing.averageTicket)} helper="Media por contrato ativo" />
        <MetricCard label="Contratos ativos" value={String(billing.activeContracts)} helper="Base recorrente monitorada" />
      </section>

      <Section title="Clientes por valor" description="Ranking financeiro para priorizar retencao, expansao e acompanhamento de contas.">
        {billing.clients.length ? (
          <BillingClientTable clients={billing.clients} />
        ) : (
          <EmptyState title="Nenhum contrato ativo encontrado" description="Quando contratos ativos entrarem na carteira, o ranking financeiro aparece aqui automaticamente." />
        )}
      </Section>
    </main>
  );
}
