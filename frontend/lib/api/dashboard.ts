import { cookies } from "next/headers";
import { toDashboardSearchParams } from "@/lib/dashboard/query";
import type {
  DashboardMetrics,
  DashboardQuery,
  MeetingsSalesChartPoint,
  RevenueChartPoint
} from "@/lib/types/dashboard";

const emptyMetrics: DashboardMetrics = {
  monthlyRevenue: 0,
  activeClients: 0,
  lostClients: 0,
  contractsExpiring: 0,
  activeContracts: 0,
  completedMeetings: 0,
  overdueTasks: 0,
  conversionRate: 0,
  clientRoi: 0,
  averageTicket: 0,
  mrr: 0,
  monthlyGrowth: 0,
  dailyRevenue: 0,
  weeklyRevenue: 0,
  pendingFollowups: 0,
  totalClients: 0,
  projectsInExecution: 0,
  projectsAtRisk: 0,
  openTasks: 0,
  lateTasks: 0,
  periodExpenses: 0,
  periodCommissions: 0,
  periodTaxes: 0,
  netProfit: 0,
  profitMargin: 0,
  pendingDeliveries: 0,
  productionDeliveries: 0,
  reviewDeliveries: 0,
  lateDeliveries: 0,
  operationalRiskRate: 0
};

export async function fetchDashboardMetrics(query: DashboardQuery): Promise<DashboardMetrics> {
  return dashboardFetch(`/api/dashboard/metrics?${toDashboardSearchParams(query).toString()}`, emptyMetrics, "Nao foi possivel carregar metricas do dashboard");
}

export async function fetchRevenueChart(query: DashboardQuery): Promise<RevenueChartPoint[]> {
  return dashboardFetch(`/api/dashboard/revenue-chart?${toDashboardSearchParams(query).toString()}`, [], "Nao foi possivel carregar grafico de receita");
}

export async function fetchMeetingsChart(query: DashboardQuery): Promise<MeetingsSalesChartPoint[]> {
  return dashboardFetch(`/api/dashboard/meetings-chart?${toDashboardSearchParams(query).toString()}`, [], "Nao foi possivel carregar grafico comercial");
}

async function dashboardFetch<T>(endpoint: string, emptyValue: T, errorMessage: string): Promise<T> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return Array.isArray(emptyValue)
      ? emptyValue
      : ({ ...emptyValue, sourceUnavailable: true } as T);
  }

  if (response.status === 401 || response.status === 403) {
    return emptyValue;
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}
