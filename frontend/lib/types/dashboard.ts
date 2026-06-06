export type DashboardMetrics = {
  monthlyRevenue: number | string;
  activeClients: number;
  lostClients: number;
  contractsExpiring: number;
  activeContracts: number;
  completedMeetings: number;
  overdueTasks: number;
  totalLeads: number;
  totalSales: number;
  conversionRate: number | string;
  clientRoi: number | string;
  averageTicket: number | string;
  mrr: number | string;
  monthlyGrowth: number | string;
  dailyRevenue: number | string;
  weeklyRevenue: number | string;
  pendingFollowups: number;
  totalClients: number;
  projectsInExecution: number;
  projectsAtRisk: number;
  openTasks: number;
  lateTasks: number;
  periodExpenses: number | string;
  periodCommissions: number | string;
  periodTaxes: number | string;
  netProfit: number | string;
  profitMargin: number | string;
  pendingDeliveries: number;
  productionDeliveries: number;
  reviewDeliveries: number;
  lateDeliveries: number;
  operationalRiskRate: number | string;
  customerChurnRate: number | string;
  contractChurnRate: number | string;
  mrrLost: number | string;
  mrrChurnRate: number | string;
  lostRecurringCustomers: number;
  nonRenewedContracts: number;
  sourceUnavailable?: boolean;
  loadError?: string;
};

export type RevenueChartPoint = {
  date: string;
  revenue: number | string;
};

export type MeetingsSalesChartPoint = {
  date: string;
  meetings: number;
  closings: number;
};

export type DashboardQuery = {
  from: string;
  to: string;
};

export type ChartPointString = {
  label: string;
  value: number;
};

export type DashboardSearchParams = {
  from?: string;
  to?: string;
};
