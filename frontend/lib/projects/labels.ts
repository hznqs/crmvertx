import type { ProjectStatus } from "@/lib/types/projects";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANEJAMENTO: "Planejamento",
  EM_EXECUCAO: "Em execucao",
  EM_REVISAO: "Em revisao",
  AGUARDANDO_CLIENTE: "Aguardando cliente",
  FINALIZADO: "Finalizado",
  PAUSADO: "Pausado",
  CANCELADO: "Cancelado"
};

export const projectStatusTone: Record<ProjectStatus, string> = {
  PLANEJAMENTO: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  EM_EXECUCAO: "bg-brand-500/15 text-fuchsia-100 ring-brand-500/20",
  EM_REVISAO: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  AGUARDANDO_CLIENTE: "bg-orange-500/12 text-orange-100 ring-orange-500/20",
  FINALIZADO: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  PAUSADO: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20",
  CANCELADO: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};
