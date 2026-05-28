export type CommissionType = "VENDA" | "RENOVACAO" | "RECORRENCIA" | "BONUS" | "MANUAL";

export type CommissionStatus = "PENDENTE" | "APROVADA" | "PAGA" | "CANCELADA";

export type CommissionSale = {
  id: string;
  memberId: string;
  type: CommissionType;
  status: CommissionStatus;
  contractId: string | null;
  financeEntryId: string | null;
  client: string | null;
  value: number | string;
  percent: number | string;
  commissionValue: number | string;
  goal: number;
  paidAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommissionPage = {
  content: CommissionSale[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type CommissionMetrics = {
  totalSales: number;
  totalRevenue: number | string;
  totalCommission: number | string;
  sourceUnavailable?: boolean;
};

export type CommissionMemberStats = {
  memberId: string;
  name: string;
  role: string;
  sales: number;
  revenue: number | string;
  commission: number | string;
  goal: number;
  goalProgress: number | string;
  xp: number;
  level: number;
  badge: string;
  productivity: number;
};

export type CommissionRanking = {
  ranking: CommissionMemberStats[];
  topCloser: string | null;
  topSdr: string | null;
  topTraffic: string | null;
  topMarketing: string | null;
  averageGoalProgress: number | string;
  sourceUnavailable?: boolean;
};

export type CommissionQuery = {
  memberId: string;
  page: number;
  size: number;
};

export type CommissionSearchParams = {
  memberId?: string;
  page?: string;
  size?: string;
};

export type CommissionSelectOption = {
  id: string;
  label: string;
};
