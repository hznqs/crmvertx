import { deliveryStatusLabels } from "@/lib/deliveries/labels";
import type { Delivery, DeliveryStatus } from "@/lib/types/deliveries";

export const deliveryKanbanStatuses = [
  "backlog",
  "planejamento",
  "producao",
  "revisao",
  "ajustes",
  "aprovado"
] as const satisfies DeliveryStatus[];

export type DeliveryKanbanStatus = (typeof deliveryKanbanStatuses)[number];

export const deliveryKanbanColumns: Record<DeliveryKanbanStatus, { title: string; description: string; accentClassName: string }> = {
  backlog: {
    title: deliveryStatusLabels.backlog,
    description: "Demandas capturadas, aguardando briefing e priorizacao.",
    accentClassName: "bg-zinc-500"
  },
  planejamento: {
    title: deliveryStatusLabels.planejamento,
    description: "Escopo, referencias, assets, agenda e plano de execucao.",
    accentClassName: "bg-sky-400"
  },
  producao: {
    title: deliveryStatusLabels.producao,
    description: "Criacao ativa pela equipe operacional.",
    accentClassName: "bg-brand-500"
  },
  revisao: {
    title: deliveryStatusLabels.revisao,
    description: "Validacao interna, QA e aprovacao do cliente.",
    accentClassName: "bg-amber-400"
  },
  ajustes: {
    title: deliveryStatusLabels.ajustes,
    description: "Correcoes finais antes da entrega.",
    accentClassName: "bg-rose-400"
  },
  aprovado: {
    title: deliveryStatusLabels.aprovado,
    description: "Entregas finalizadas, aprovadas e historizadas.",
    accentClassName: "bg-emerald-400"
  }
};

export function normalizeDeliveryStatus(status: DeliveryStatus): DeliveryKanbanStatus {
  return status === "pendente" ? "backlog" : status;
}

export function groupDeliveriesByStatus(deliveries: Delivery[]) {
  return deliveryKanbanStatuses.reduce<Record<DeliveryKanbanStatus, Delivery[]>>((groups, status) => {
    groups[status] = deliveries
      .filter((delivery) => normalizeDeliveryStatus(delivery.status) === status)
      .sort(sortDeliveryCards);
    return groups;
  }, {} as Record<DeliveryKanbanStatus, Delivery[]>);
}

export function deliveryProgress(status: DeliveryStatus) {
  const normalizedStatus = normalizeDeliveryStatus(status);
  const index = deliveryKanbanStatuses.indexOf(normalizedStatus);
  return Math.round(((index + 1) / deliveryKanbanStatuses.length) * 100);
}

export function isDeliveryOverdue(delivery: Delivery) {
  if (normalizeDeliveryStatus(delivery.status) === "aprovado") {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(delivery.deadline) < today;
}

export function deliveryPriority(delivery: Delivery) {
  if (isDeliveryOverdue(delivery)) {
    return "Critica";
  }
  const days = daysUntil(delivery.deadline);
  if (days <= 2) {
    return "Alta";
  }
  if (days <= 7) {
    return "Media";
  }
  return "Normal";
}

export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function sortDeliveryCards(first: Delivery, second: Delivery) {
  const firstOverdue = isDeliveryOverdue(first) ? 0 : 1;
  const secondOverdue = isDeliveryOverdue(second) ? 0 : 1;
  if (firstOverdue !== secondOverdue) {
    return firstOverdue - secondOverdue;
  }
  return new Date(first.deadline).getTime() - new Date(second.deadline).getTime();
}
