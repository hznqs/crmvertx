export type ClientPerformanceRecord = {
  id: string;
  clientId: string | null;
  date: string;
  leads: number;
  sales: number;
  revenue: number | string;
  investment: number | string;
  cpl: number | string;
  conversionRate: number | string;
  roi: number | string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PerformancePage = {
  content: ClientPerformanceRecord[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
};

export type PerformanceQuery = {
  clientId: string;
  from: string;
  to: string;
  page: number;
  size: number;
};

export type PerformanceSearchParams = {
  clientId?: string;
  from?: string;
  to?: string;
  page?: string;
  size?: string;
};

export type PerformanceClientOption = {
  id: string;
  label: string;
};
