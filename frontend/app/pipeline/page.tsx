import Link from "next/link";
import { PipelineAnalytics } from "@/components/pipeline/pipeline-analytics";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { PipelineFilters } from "@/components/pipeline/pipeline-filters";
import { PipelineMetrics } from "@/components/pipeline/pipeline-metrics";
import { fetchLeads } from "@/lib/api/leads";
import { buildLeadQuery } from "@/lib/leads/query";
import type { LeadSearchParams } from "@/lib/types/leads";

type PipelinePageProps = {
  searchParams: Promise<LeadSearchParams>;
};

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const resolvedSearchParams = await searchParams;
  const query = buildLeadQuery({
    ...resolvedSearchParams,
    size: resolvedSearchParams.size ?? "100",
    status: resolvedSearchParams.status ?? "ACTIVE",
    active: "true"
  });
  const leadPage = await fetchLeads(query);
  const loadError = leadPage.loadError;
  const boardStateKey = leadPage.content
    .map((lead) => `${lead.id}:${lead.commercialStage}:${lead.status}:${lead.active}:${lead.updatedAt}`)
    .join("|");

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-[#090909] p-5 shadow-[0_0_0_1px_rgba(234,89,220,.08),0_30px_90px_rgba(0,0,0,.5)] md:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Pipeline CRM enterprise
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
            Clientes e contratos
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Pipeline visual para controlar leads, contatos, propostas, negociacoes, contratos, origem, responsaveis, valor previsto e atividade recente.
          </p>
        </div>
        <Link href="/leads" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-600 px-5 text-sm font-black text-white shadow-[0_0_34px_rgba(234,89,220,.22)] transition hover:bg-brand-500">
          Gerenciar leads
        </Link>
        </div>
      </section>

      <PipelineMetrics leads={leadPage.content} totalElements={leadPage.totalElements} />

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <PipelineAnalytics leads={leadPage.content} />

      <section className="rounded-2xl bg-panel/95 p-4 shadow-panel md:p-5">
        <PipelineFilters query={query} />
        <PipelineBoard key={boardStateKey} leads={leadPage.content} />
      </section>
    </main>
  );
}
