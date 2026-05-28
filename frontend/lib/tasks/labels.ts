import type { TaskPriority, TaskStatus } from "@/lib/types/tasks";

export const taskPriorityLabels: Record<TaskPriority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Critica"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em andamento",
  EM_REVISAO: "Em revisao",
  CONCLUIDA: "Concluida",
  ATRASADA: "Atrasada",
  CANCELADA: "Cancelada"
};

export const taskPriorityTone: Record<TaskPriority, string> = {
  BAIXA: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  MEDIA: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20",
  ALTA: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  CRITICA: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};

export const taskStatusTone: Record<TaskStatus, string> = {
  PENDENTE: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  EM_ANDAMENTO: "bg-brand-500/15 text-fuchsia-100 ring-brand-500/20",
  EM_REVISAO: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  CONCLUIDA: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  ATRASADA: "bg-rose-500/12 text-rose-100 ring-rose-500/20",
  CANCELADA: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20"
};
