export type GoalType = "FATURAMENTO" | "VENDAS" | "CLIENTES" | "REUNIOES" | "ENTREGAS" | "LUCRO" | "LEADS" | "TAREFAS" | "PROJETOS" | "COMISSAO";

export type GoalStatus = "EM_ANDAMENTO" | "ATINGIDA" | "ATRASADA" | "CANCELADA";

export type Goal = {
  id: string;
  name: string | null;
  type: GoalType;
  target: number | string;
  actual: number | string;
  progress: number | string;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
  responsible: string | null;
  status: GoalStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GoalPage = {
  content: Goal[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  loadError?: string;
};

export type GoalQuery = {
  from: string;
  to: string;
  page: number;
  size: number;
};

export type GoalSearchParams = {
  from?: string;
  to?: string;
  page?: string;
  size?: string;
};
