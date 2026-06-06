import type { CostCenter, FinanceEntryStatus, FinanceEntryType } from "@/lib/types/finance";

export const financeTypeLabels: Record<FinanceEntryType, string> = {
  receita: "Receita",
  despesa: "Despesa",
  comissao: "Comissao",
  imposto: "Imposto"
};

export const financeStatusLabels: Record<FinanceEntryStatus, string> = {
  pago: "Pago",
  pendente: "Pendente",
  vencido: "Vencido",
  cancelado: "Cancelado"
};

export const costCenterLabels: Record<CostCenter, string> = {
  operacional: "Operacional",
  vendas: "Vendas",
  marketing: "Marketing",
  desenvolvimento: "Desenvolvimento",
  administrativo: "Administrativo",
  ferramentas: "Ferramentas"
};

export const financeTypeTone: Record<FinanceEntryType, string> = {
  receita: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  despesa: "bg-rose-500/12 text-rose-100 ring-rose-500/20",
  comissao: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  imposto: "bg-sky-500/12 text-sky-100 ring-sky-500/20"
};

export const financeStatusTone: Record<FinanceEntryStatus, string> = {
  pago: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  pendente: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  vencido: "bg-rose-500/12 text-rose-100 ring-rose-500/20",
  cancelado: "bg-zinc-500/12 text-zinc-200 ring-zinc-500/20"
};
