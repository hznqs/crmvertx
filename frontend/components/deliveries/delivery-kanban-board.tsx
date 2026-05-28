"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, CalendarClock, CheckCircle2, MessageSquare, Paperclip, Search, UserRound } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { EnterpriseKanban, type EnterpriseKanbanColumn } from "@/components/kanban/enterprise-kanban";
import {
  deliveryKanbanColumns,
  deliveryKanbanStatuses,
  deliveryPriority,
  deliveryProgress,
  groupDeliveriesByStatus,
  isDeliveryOverdue,
  normalizeDeliveryStatus,
  type DeliveryKanbanStatus
} from "@/lib/deliveries/kanban";
import { updateDeliveryStatusDirectAction } from "@/lib/deliveries/actions";
import { formatDate } from "@/lib/formatters";
import type { Delivery, DeliverySelectOption } from "@/lib/types/deliveries";
import { cn } from "@/lib/utils";

type DeliveryKanbanBoardProps = {
  deliveries: Delivery[];
  clientOptions: DeliverySelectOption[];
};

export function DeliveryKanbanBoard({ deliveries, clientOptions }: DeliveryKanbanBoardProps) {
  const [localDeliveries, setLocalDeliveries] = useState(deliveries);
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("");
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliveryKanbanStatus }) => updateDeliveryStatusDirectAction(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    }
  });
  const filteredDeliveries = useMemo(() => filterDeliveries(localDeliveries, search, owner), [localDeliveries, search, owner]);
  const grouped = useMemo(() => groupDeliveriesByStatus(filteredDeliveries), [filteredDeliveries]);
  const columns = useMemo<EnterpriseKanbanColumn<DeliveryKanbanStatus, Delivery>[]>(() => (
    deliveryKanbanStatuses.map((status) => ({
      id: status,
      title: deliveryKanbanColumns[status].title,
      description: deliveryKanbanColumns[status].description,
      accentClassName: deliveryKanbanColumns[status].accentClassName,
      cards: grouped[status]
    }))
  ), [grouped]);

  function moveDelivery(deliveryId: string, targetStatus: DeliveryKanbanStatus) {
    const currentDelivery = localDeliveries.find((delivery) => delivery.id === deliveryId);
    if (!currentDelivery || normalizeDeliveryStatus(currentDelivery.status) === targetStatus) {
      return;
    }

    const previousDeliveries = localDeliveries;
    setLocalDeliveries((current) => current.map((delivery) => (
      delivery.id === deliveryId ? { ...delivery, status: targetStatus, updatedAt: new Date().toISOString() } : delivery
    )));

    startTransition(() => {
      mutation.mutate(
        { id: deliveryId, status: targetStatus },
        {
          onError: () => {
            setLocalDeliveries(previousDeliveries);
            toast.error("Nao foi possivel mover a entrega.");
          },
          onSuccess: () => {
            toast.success("Entrega movida", {
              description: `Status atualizado para ${deliveryKanbanColumns[targetStatus].title}.`
            });
          }
        }
      );
    });
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 rounded-2xl border border-line bg-[#090909]/90 p-4 md:grid-cols-[minmax(0,1.4fr)_280px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar titulo, tipo, descricao, cliente ou tag"
            className="min-h-11 w-full rounded-xl border border-line bg-white/[0.045] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
          />
        </label>
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Responsavel"
          className="min-h-11 rounded-xl border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <div className="flex items-center justify-end gap-2 text-xs font-black text-zinc-500">
          {isPending || mutation.isPending ? <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" /> : null}
          Realtime ready
        </div>
      </section>

      <EnterpriseKanban
        columns={columns}
        getCardId={(delivery) => delivery.id}
        onMove={moveDelivery}
        emptyLabel="Sem entregas nesta etapa."
        estimateCardSize={244}
        renderCard={(delivery) => (
          <DeliveryKanbanCard delivery={delivery} clientName={clientOptions.find((client) => client.id === delivery.clientId)?.label ?? "Cliente nao vinculado"} />
        )}
      />
    </div>
  );
}

function DeliveryKanbanCard({ delivery, clientName }: { delivery: Delivery; clientName: string }) {
  const progress = deliveryProgress(delivery.status);
  const overdue = isDeliveryOverdue(delivery);
  const priority = deliveryPriority(delivery);
  const checklistDone = Math.max(1, Math.round(progress / 25));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black ring-1", priorityTone(priority))}>
              {priority}
            </span>
            {overdue ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-black text-rose-100 ring-1 ring-rose-400/25">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                Atrasada
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 line-clamp-2 text-sm font-black leading-5 text-white">{delivery.title}</h3>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-brand-400">{clientName}</p>
        </div>
      </div>

      <p className="line-clamp-2 text-xs leading-5 text-zinc-500">
        {delivery.description || `${delivery.type} com checklist operacional, comentarios, anexos e atividade preparada.`}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {[delivery.type, "SLA", "QA"].map((tag) => (
          <span key={tag} className="rounded-md border border-line bg-white/[0.045] px-2 py-1 text-[11px] font-bold text-zinc-300">
            {tag}
          </span>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] font-black text-zinc-500">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5 text-brand-400" aria-hidden />
          {delivery.owner}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-brand-400" aria-hidden />
          {formatDate(delivery.deadline)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-brand-400" aria-hidden />
          {checklistDone}/4 checks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-brand-400" aria-hidden />
          atividade
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3">
        <div className="flex -space-x-2">
          {initials(delivery.owner).map((initial, index) => (
            <span key={`${initial}-${index}`} className="grid h-7 w-7 place-items-center rounded-full border border-[#090909] bg-brand-600 text-[10px] font-black text-white">
              {initial}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500">
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
          anexos
        </span>
      </div>
    </div>
  );
}

function filterDeliveries(deliveries: Delivery[], search: string, owner: string) {
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedOwner = owner.trim().toLowerCase();
  return deliveries.filter((delivery) => {
    const searchable = [
      delivery.title,
      delivery.type,
      delivery.description,
      delivery.owner,
      delivery.status
    ].join(" ").toLowerCase();
    return (!normalizedSearch || searchable.includes(normalizedSearch))
      && (!normalizedOwner || delivery.owner.toLowerCase().includes(normalizedOwner));
  });
}

function priorityTone(priority: string) {
  if (priority === "Critica") return "bg-rose-500/15 text-rose-100 ring-rose-400/25";
  if (priority === "Alta") return "bg-amber-500/15 text-amber-100 ring-amber-400/25";
  if (priority === "Media") return "bg-brand-500/15 text-fuchsia-100 ring-brand-400/25";
  return "bg-white/[0.06] text-zinc-200 ring-white/10";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const values = parts.length > 1 ? [parts[0], parts[1]] : [parts[0] ?? "OP"];
  return values.map((part) => part.slice(0, 1).toUpperCase());
}
