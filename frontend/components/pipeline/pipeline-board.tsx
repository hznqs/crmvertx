"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarClock, DollarSign, Mail, Phone, Search, UserRound } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { EnterpriseKanban, type EnterpriseKanbanColumn } from "@/components/kanban/enterprise-kanban";
import { ModalDialog } from "@/components/ui/modal-dialog";
import { PremiumSelect } from "@/components/ui/premium-select";
import { formatCurrency } from "@/lib/formatters";
import { commercialStageLabels, leadOriginLabels, leadTemperatureLabels } from "@/lib/leads/labels";
import { updatePipelineLeadStageAction } from "@/lib/pipeline/actions";
import { groupLeadsByStage, pipelineStages, sumPotentialValue } from "@/lib/pipeline/metrics";
import type { CommercialStage, Lead } from "@/lib/types/leads";
import { cn } from "@/lib/utils";

type PipelineBoardProps = {
  leads: Lead[];
};

type LostDialogState = {
  leadId: string;
  leadName: string;
  targetStage: CommercialStage;
};

const columnMeta: Record<CommercialStage, { description: string; accentClassName: string }> = {
  NOVO: { description: "Leads capturados e aguardando abordagem.", accentClassName: "bg-zinc-500" },
  CONTATO: { description: "Primeiro contato iniciado e qualificação em curso.", accentClassName: "bg-sky-400" },
  REUNIAO: { description: "Diagnostico, briefing e reuniao comercial.", accentClassName: "bg-brand-500" },
  PROPOSTA: { description: "Proposta enviada, escopo e oferta em avaliacao.", accentClassName: "bg-amber-400" },
  NEGOCIACAO: { description: "Negociacao ativa, ajustes de contrato e decisores.", accentClassName: "bg-orange-400" },
  FECHADO: { description: "Cliente ganho, contrato ativo ou em onboarding.", accentClassName: "bg-emerald-400" },
  PERDIDO: { description: "Oportunidades perdidas com motivo registrado.", accentClassName: "bg-rose-400" }
};

export function PipelineBoard({ leads }: PipelineBoardProps) {
  const [localLeads, setLocalLeads] = useState(leads);
  const [search, setSearch] = useState("");
  const [temperature, setTemperature] = useState("");
  const [lostDialog, setLostDialog] = useState<LostDialogState | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ leadId, stage, lostReason }: { leadId: string; stage: CommercialStage; lostReason?: string }) =>
      updatePipelineLeadStageAction(leadId, stage, lostReason ?? ""),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
  const filteredLeads = useMemo(() => filterLeads(localLeads, search, temperature), [localLeads, search, temperature]);
  const groupedLeads = useMemo(() => groupLeadsByStage(filteredLeads), [filteredLeads]);
  const columns = useMemo<EnterpriseKanbanColumn<CommercialStage, Lead>[]>(() => (
    pipelineStages.map((stage) => ({
      id: stage,
      title: commercialStageLabels[stage],
      description: columnMeta[stage].description,
      accentClassName: columnMeta[stage].accentClassName,
      cards: groupedLeads[stage],
      totalValue: formatCurrency(sumPotentialValue(groupedLeads[stage]))
    }))
  ), [groupedLeads]);

  function moveLead(leadId: string, targetStage: CommercialStage, lostReason = "") {
    const draggedLead = localLeads.find((lead) => lead.id === leadId);
    if (!draggedLead || draggedLead.commercialStage === targetStage) {
      return;
    }

    if (targetStage === "PERDIDO" && !lostReason) {
      setLostDialog({ leadId, leadName: draggedLead.name, targetStage });
      return;
    }

    const previousLeads = localLeads;
    setLocalLeads((currentLeads) => currentLeads.map((lead) => (
      lead.id === leadId
        ? { ...lead, commercialStage: targetStage, status: targetStage === "PERDIDO" ? "LOST" : lead.status, updatedAt: new Date().toISOString() }
        : lead
    )));

    startTransition(() => {
      mutation.mutate(
        { leadId, stage: targetStage, lostReason },
        {
          onError: () => {
            setLocalLeads(previousLeads);
            toast.error("Nao foi possivel mover a oportunidade.");
          },
          onSuccess: () => {
            toast.success("Pipeline atualizado", {
              description: `${draggedLead.name} movido para ${commercialStageLabels[targetStage]}.`
            });
          }
        }
      );
    });
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 rounded-2xl border border-line bg-[#090909]/90 p-4 md:grid-cols-[minmax(0,1.4fr)_260px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar empresa, contato, email, telefone, origem ou tags"
            className="min-h-11 w-full rounded-xl border border-line bg-white/[0.045] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
          />
        </label>
        <PremiumSelect
          value={temperature}
          onChange={setTemperature}
          placeholder="Todas temperaturas"
          options={[{ value: "", label: "Todas temperaturas" }, ...Object.entries(leadTemperatureLabels).map(([value, label]) => ({ value, label }))]}
        />
        <div className="flex items-center justify-end gap-2 text-xs font-black text-zinc-500">
          {isPending || mutation.isPending ? <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" /> : null}
          Optimistic UI
        </div>
      </section>

      <EnterpriseKanban
        columns={columns}
        getCardId={(lead) => lead.id}
        onMove={moveLead}
        emptyLabel="Sem oportunidades nesta etapa."
        estimateCardSize={252}
        renderCard={(lead) => <PipelineCard lead={lead} />}
      />

      {lostDialog ? (
        <LostReasonDialog
          state={lostDialog}
          onCancel={() => setLostDialog(null)}
          onConfirm={(lostReason) => {
            moveLead(lostDialog.leadId, lostDialog.targetStage, lostReason);
            setLostDialog(null);
          }}
        />
      ) : null}
    </div>
  );
}

function PipelineCard({ lead }: { lead: Lead }) {
  const company = lead.companyName || lead.name;
  const contractStatus = lead.commercialStage === "FECHADO" ? "Contrato ganho" : lead.commercialStage === "PERDIDO" ? "Contrato perdido" : "Em negociacao";
  const plan = planFromValue(lead.potentialValue);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black ring-1", temperatureTone(lead.temperature))}>
              {leadTemperatureLabels[lead.temperature]}
            </span>
            <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-black text-fuchsia-100 ring-1 ring-brand-400/25">
              {contractStatus}
            </span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 text-white">{company}</h3>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-brand-400">{lead.name}</p>
        </div>
        <span className="rounded-xl bg-white/[0.045] px-2.5 py-2 text-xs font-black text-white">
          {formatCurrency(lead.potentialValue)}
        </span>
      </div>

      <div className="grid gap-2 text-[11px] text-zinc-400">
        <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-brand-400" aria-hidden />{plan}</span>
        <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-brand-400" aria-hidden />{lead.phone || "Telefone pendente"}</span>
        <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-brand-400" aria-hidden />{lead.email || "Email pendente"}</span>
        <span className="inline-flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-brand-400" aria-hidden />{leadOriginLabels[lead.origin]}</span>
      </div>

      <p className="line-clamp-2 rounded-xl border border-line bg-white/[0.025] p-3 text-xs leading-5 text-zinc-500">
        {lead.notes || "Proxima acao: qualificar decisores, budget e timing. Timeline e atividade recente preparadas para realtime."}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {[lead.segment || "CRM", leadOriginLabels[lead.origin], "follow-up"].map((tag) => (
          <span key={tag} className="rounded-md border border-line bg-white/[0.045] px-2 py-1 text-[11px] font-bold text-zinc-300">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3 text-[11px] font-bold text-zinc-500">
        <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-brand-400" aria-hidden />Responsavel</span>
        <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-brand-400" aria-hidden />{new Date(lead.updatedAt).toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  );
}

function LostReasonDialog({
  state,
  onCancel,
  onConfirm
}: {
  state: LostDialogState;
  onCancel: () => void;
  onConfirm: (lostReason: string) => void;
}) {
  const [lostReason, setLostReason] = useState("");

  return (
    <ModalDialog title={state.leadName} eyebrow="Motivo da perda" onClose={onCancel} maxWidthClassName="max-w-lg">
      <textarea
        value={lostReason}
        onChange={(event) => setLostReason(event.target.value)}
        className="mt-5 min-h-28 w-full rounded-lg border border-line bg-white/[0.045] px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        placeholder="Ex.: Sem budget neste trimestre"
      />
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-bold text-zinc-200 hover:bg-white/[0.09]">
          Cancelar
        </button>
        <button
          type="button"
          disabled={!lostReason.trim()}
          onClick={() => onConfirm(lostReason.trim())}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-bold text-white shadow-panel transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Confirmar perda
        </button>
      </div>
    </ModalDialog>
  );
}

function filterLeads(leads: Lead[], search: string, temperature: string) {
  const normalizedSearch = search.trim().toLowerCase();
  return leads.filter((lead) => {
    const searchable = [
      lead.name,
      lead.companyName,
      lead.email,
      lead.phone,
      lead.segment,
      lead.origin,
      lead.notes
    ].join(" ").toLowerCase();
    return (!normalizedSearch || searchable.includes(normalizedSearch))
      && (!temperature || lead.temperature === temperature);
  });
}

function temperatureTone(temperature: Lead["temperature"]) {
  if (temperature === "QUENTE") return "bg-rose-500/15 text-rose-100 ring-rose-400/25";
  if (temperature === "MORNO") return "bg-amber-500/15 text-amber-100 ring-amber-400/25";
  return "bg-sky-500/15 text-sky-100 ring-sky-400/25";
}

function planFromValue(value: number) {
  if (value >= 15_000) return "Plano Enterprise";
  if (value >= 7_000) return "Plano Growth";
  return "Plano Starter";
}
