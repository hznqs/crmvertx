import type { DeliveryStatus } from "@/lib/types/deliveries";

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  backlog: "Backlog",
  planejamento: "Planejamento",
  producao: "Em andamento",
  revisao: "Revisao",
  ajustes: "Ajustes",
  aprovado: "Entregue",
  pendente: "Backlog"
};

export const deliveryStatusTone: Record<DeliveryStatus, string> = {
  backlog: "bg-white/[0.06] text-zinc-200 ring-white/10",
  planejamento: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  producao: "bg-brand-500/15 text-fuchsia-100 ring-brand-500/20",
  revisao: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  ajustes: "bg-rose-500/12 text-rose-100 ring-rose-500/20",
  aprovado: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  pendente: "bg-white/[0.06] text-zinc-200 ring-white/10"
};

export const deliveryTypeSuggestions = [
  "Briefing",
  "Planejamento",
  "Design",
  "Desenvolvimento",
  "Conteudo",
  "Revisao",
  "Publicacao",
  "Relatorio"
];
