import type { ContractStatus } from "@/lib/types/contracts";

export const contractStatusLabels: Record<ContractStatus, string> = {
  ativo: "Ativo",
  encerrado: "Encerrado",
  pausado: "Pausado",
  cancelado: "Cancelado"
};

export const contractStatusTone: Record<ContractStatus, string> = {
  ativo: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  encerrado: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20",
  pausado: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  cancelado: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};
