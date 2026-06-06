import type { ContractStatus } from "@/lib/types/contracts";

export const contractStatusLabels: Record<ContractStatus, string> = {
  rascunho: "Rascunho",
  pendente: "Pendente",
  ativo: "Ativo",
  vencido: "Vencido",
  cancelado: "Cancelado",
  concluido: "Concluido",
  encerrado: "Encerrado",
  pausado: "Pausado",
  nao_renovado: "Nao renovado",
  renovado: "Renovado",
  em_andamento: "Em andamento",
  aprovado: "Aprovado",
  vigente: "Vigente"
};

export const contractStatusTone: Record<ContractStatus, string> = {
  rascunho: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20",
  pendente: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  ativo: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  vencido: "bg-rose-500/12 text-rose-100 ring-rose-500/20",
  cancelado: "bg-rose-500/12 text-rose-100 ring-rose-500/20",
  concluido: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  encerrado: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20",
  pausado: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  nao_renovado: "bg-orange-500/12 text-orange-100 ring-orange-500/20",
  renovado: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  em_andamento: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  aprovado: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  vigente: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20"
};
