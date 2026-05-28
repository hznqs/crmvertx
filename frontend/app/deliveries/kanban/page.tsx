import Link from "next/link";
import { DeliveryKanbanAnalytics } from "@/components/deliveries/delivery-kanban-analytics";
import { DeliveryKanbanBoard } from "@/components/deliveries/delivery-kanban-board";
import { DeliveryMetrics } from "@/components/deliveries/delivery-metrics";
import { fetchClients } from "@/lib/api/clients";
import { fetchDeliveries, fetchDeliverySummary } from "@/lib/api/deliveries";
import { buildClientQuery } from "@/lib/clients/query";
import { buildDeliveryQuery } from "@/lib/deliveries/query";
import type { DeliverySearchParams, DeliverySelectOption } from "@/lib/types/deliveries";

type DeliveriesKanbanPageProps = {
  searchParams: Promise<DeliverySearchParams>;
};

export default async function DeliveriesKanbanPage({ searchParams }: DeliveriesKanbanPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = buildDeliveryQuery({
    ...resolvedSearchParams,
    size: resolvedSearchParams.size ?? "100"
  });
  const [deliveryPage, summary, clientPage] = await Promise.all([
    fetchDeliveries(query),
    fetchDeliverySummary({ clientId: query.clientId, owner: query.owner }),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" }))
  ]);
  const clientOptions = clientPage.content.map(toOption);

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-[#090909] p-5 shadow-[0_0_0_1px_rgba(234,89,220,.08),0_30px_90px_rgba(0,0,0,.5)] md:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-400">
              Kanban operacional premium
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
              Entregas da agencia
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Controle sites, landing pages, trafego pago, social media, branding, automacoes, CRM, SEO e design com drag and drop, SLA visual e activity tracking.
            </p>
          </div>
          <Link href="/deliveries" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-600 px-5 text-sm font-black text-white shadow-[0_0_34px_rgba(234,89,220,.22)] transition hover:bg-brand-500">
            Lista operacional
          </Link>
        </div>
      </section>

      <DeliveryMetrics summary={summary} />

      {deliveryPage.sourceUnavailable || summary.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot para carregar o Kanban real.
        </div>
      ) : null}

      <DeliveryKanbanAnalytics deliveries={deliveryPage.content} />
      <DeliveryKanbanBoard deliveries={deliveryPage.content} clientOptions={clientOptions} />
    </main>
  );
}

function toOption(entity: { id: string; name: string }): DeliverySelectOption {
  return { id: entity.id, label: entity.name };
}
