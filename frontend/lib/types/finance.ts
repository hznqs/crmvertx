export type FinanceEntryType = "receita" | "despesa" | "comissao" | "imposto";

export type FinanceEntryStatus = "pago" | "pendente" | "vencido";

export type CostCenter =
  | "operacional"
  | "vendas"
  | "marketing"
  | "desenvolvimento"
  | "administrativo"
  | "ferramentas";

export type FinanceEntry = {
  id: string;
  clientId: string | null;
  contractId: string | null;
  projectId: string | null;
  serviceId: string | null;
  type: FinanceEntryType;
  status: FinanceEntryStatus;
  description: string;
  value: number | string;
  due: string;
  recurring: boolean;
  autoBilling: boolean;
  costCenter: CostCenter;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FinanceEntryPage = {
  content: FinanceEntry[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type FinanceSummary = {
  recurringRevenue: number | string;
  forecast: number | string;
  netProfit: number | string;
  margin: number | string;
  overdue: number | string;
  autoBillingCount: number;
  commissions: number | string;
  taxes: number | string;
  grossRevenue: number | string;
  expenses: number | string;
  sourceUnavailable?: boolean;
};

export type FinanceQuery = {
  type: string;
  status: string;
  from: string;
  to: string;
  page: number;
  size: number;
};

export type FinanceSearchParams = {
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
  size?: string;
};

export type FinanceSelectOption = {
  id: string;
  label: string;
};
