export type GoalType = "FATURAMENTO" | "VENDAS" | "CLIENTES" | "REUNIOES" | "ENTREGAS" | "LUCRO";

export type Goal = {
  id: string;
  type: GoalType;
  target: number | string;
  actual: number | string;
  progress: number | string;
  date: string;
  periodStart: string | null;
  periodEnd: string | null;
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
