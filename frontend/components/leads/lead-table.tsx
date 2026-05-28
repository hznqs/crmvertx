import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  commercialStageLabels,
  leadOriginLabels,
  leadTemperatureLabels
} from "@/lib/leads/labels";
import { LeadRowActions } from "@/components/leads/lead-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Lead, LeadPage } from "@/lib/types/leads";

type LeadTableProps = {
  leadPage: LeadPage;
  actionPermissions: ModuleActionPermissions;
};

export function LeadTable({ leadPage, actionPermissions }: LeadTableProps) {
  if (leadPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum lead encontrado</p>
        <p className="mt-2 text-sm text-muted">
          Ajuste os filtros ou cadastre uma nova oportunidade comercial.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Lead</th>
              <th className="px-5 py-4 font-bold">Fase</th>
              <th className="px-5 py-4 font-bold">Temperatura</th>
              <th className="px-5 py-4 font-bold">Origem</th>
              <th className="px-5 py-4 font-bold">Valor</th>
              <th className="px-5 py-4 font-bold">Criado em</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {leadPage.content.map((lead) => (
              <LeadRow key={lead.id} lead={lead} actionPermissions={actionPermissions} />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>
          Pagina {leadPage.number + 1} de {leadPage.totalPages}
        </span>
        <span>{leadPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function LeadRow({
  lead,
  actionPermissions
}: {
  lead: Lead;
  actionPermissions: ModuleActionPermissions;
}) {
  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{lead.name}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {lead.companyName || "Sem empresa"} · {lead.email || lead.phone || "Sem contato"}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <Badge tone="brand">{commercialStageLabels[lead.commercialStage]}</Badge>
      </td>
      <td className="px-5 py-4">
        <Badge tone={lead.temperature === "QUENTE" ? "hot" : "neutral"}>
          {leadTemperatureLabels[lead.temperature]}
        </Badge>
      </td>
      <td className="px-5 py-4 text-zinc-300">{leadOriginLabels[lead.origin]}</td>
      <td className="px-5 py-4 font-semibold text-white">
        {formatCurrency(lead.potentialValue)}
      </td>
      <td className="px-5 py-4 text-zinc-400">{formatDate(lead.createdAt)}</td>
      <td className="px-5 py-4">
        <LeadRowActions lead={lead} actionPermissions={actionPermissions} />
      </td>
    </tr>
  );
}

function Badge({
  children,
  tone
}: Readonly<{
  children: React.ReactNode;
  tone: "brand" | "hot" | "neutral";
}>) {
  const toneClassName = {
    brand: "bg-brand-500/15 text-fuchsia-200",
    hot: "bg-rose-500/15 text-rose-200",
    neutral: "bg-white/[0.06] text-zinc-300"
  }[tone];

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneClassName}`}>
      {children}
    </span>
  );
}
