export type ContractStatus = "ativo" | "encerrado" | "pausado" | "cancelado";

export type Contract = {
  id: string;
  clientId: string | null;
  serviceId: string | null;
  projectId: string | null;
  plan: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  monthlyValue: number | string;
  totalValue: number | string;
  durationMonths: number;
  billingDueDay: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContractPage = {
  content: Contract[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type ContractSummary = {
  active: number;
  expiringSoon: number;
  autoRenew: number;
  mrr: number | string;
  sourceUnavailable?: boolean;
};

export type ContractQuery = {
  status: string;
  clientId: string;
  page: number;
  size: number;
};

export type ContractSearchParams = {
  status?: string;
  clientId?: string;
  page?: string;
  size?: string;
};

export type ContractSelectOption = {
  id: string;
  label: string;
};
