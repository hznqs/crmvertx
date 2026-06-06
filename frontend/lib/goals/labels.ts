import type { GoalType } from "@/lib/types/goals";

export const goalTypeLabels: Record<GoalType, string> = {
  FATURAMENTO: "Faturamento",
  VENDAS: "Vendas",
  CLIENTES: "Clientes",
  REUNIOES: "Reunioes",
  ENTREGAS: "Entregas",
  LUCRO: "Lucro",
  LEADS: "Leads",
  TAREFAS: "Tarefas",
  PROJETOS: "Projetos",
  COMISSAO: "Comissao"
};

export const monetaryGoalTypes = new Set<GoalType>(["FATURAMENTO", "LUCRO", "COMISSAO"]);

export const goalTypeTone: Record<GoalType, string> = {
  FATURAMENTO: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  VENDAS: "bg-brand-500/15 text-fuchsia-100 ring-brand-500/20",
  CLIENTES: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  REUNIOES: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  ENTREGAS: "bg-teal-500/12 text-teal-100 ring-teal-500/20",
  LUCRO: "bg-lime-500/12 text-lime-100 ring-lime-500/20",
  LEADS: "bg-blue-500/12 text-blue-100 ring-blue-500/20",
  TAREFAS: "bg-indigo-500/12 text-indigo-100 ring-indigo-500/20",
  PROJETOS: "bg-purple-500/12 text-purple-100 ring-purple-500/20",
  COMISSAO: "bg-pink-500/12 text-pink-100 ring-pink-500/20"
};
