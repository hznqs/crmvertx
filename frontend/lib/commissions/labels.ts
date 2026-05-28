import type { CommissionStatus, CommissionType } from "@/lib/types/commissions";

export const commissionTypeLabels: Record<CommissionType, string> = {
  VENDA: "Venda",
  RENOVACAO: "Renovacao",
  RECORRENCIA: "Recorrencia",
  BONUS: "Bonus",
  MANUAL: "Manual"
};

export const commissionStatusLabels: Record<CommissionStatus, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  PAGA: "Paga",
  CANCELADA: "Cancelada"
};

export const commissionStatusTone: Record<CommissionStatus, string> = {
  PENDENTE: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  APROVADA: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  PAGA: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  CANCELADA: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};
