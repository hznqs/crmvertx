import type { ServiceBillingType } from "@/lib/types/services";

export type ContractStatus =
  | "rascunho"
  | "pendente"
  | "ativo"
  | "vencido"
  | "cancelado"
  | "concluido"
  | "encerrado"
  | "pausado"
  | "nao_renovado"
  | "renovado"
  | "em_andamento"
  | "aprovado"
  | "vigente";

export type Contract = {
  id: string;
  clientId: string | null;
  serviceIds: string[];
  serviceId: string | null;
  projectId: string | null;
  serviceItems: ContractServiceItem[];
  sellerName: string | null;
  plan: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  monthlyValue: number | string;
  oneTimeServicesValue: number | string;
  implementationFee: number | string;
  discount: number | string;
  totalValue: number | string;
  durationMonths: number;
  billingDueDay: number | null;
  paymentMethod: string | null;
  notes: string | null;
  cancelledAt: string | null;
  endedAt: string | null;
  cancellationReason: string | null;
  churnReason: string | null;
  nonRenewalReason: string | null;
  recurring: boolean;
  mrrLost: number | string;
  renewedFromContractId: string | null;
  renewedToContractId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContractServiceItem = {
  id: string;
  serviceId: string | null;
  serviceName: string;
  serviceValue: number | string;
  billingType: ServiceBillingType;
  serviceActiveSnapshot: boolean;
  quantity: number;
};

export type ContractPage = {
  content: Contract[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  loadError?: string;
};

export type ContractSummary = {
  active: number;
  expiringSoon: number;
  autoRenew: number;
  mrr: number | string;
  sourceUnavailable?: boolean;
  loadError?: string;
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
  basePrice?: number;
  billingType?: ServiceBillingType;
  active?: boolean;
};
