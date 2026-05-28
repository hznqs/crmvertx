import { cookies } from "next/headers";
import { toCommissionSearchParams } from "@/lib/commissions/query";
import type { CommissionMetrics, CommissionPage, CommissionQuery, CommissionRanking } from "@/lib/types/commissions";

const emptyCommissionPage: CommissionPage = {
  content: [],
  number: 0,
  size: 50,
  totalPages: 1,
  totalElements: 0
};

const emptyMetrics: CommissionMetrics = {
  totalSales: 0,
  totalRevenue: 0,
  totalCommission: 0
};

const emptyRanking: CommissionRanking = {
  ranking: [],
  topCloser: null,
  topSdr: null,
  topTraffic: null,
  topMarketing: null,
  averageGoalProgress: 0
};

export async function fetchCommissions(query: CommissionQuery): Promise<CommissionPage> {
  return commissionFetch(`/api/commission-sales?${toCommissionSearchParams(query).toString()}`, emptyCommissionPage, "Nao foi possivel carregar comissoes");
}

export async function fetchCommissionMetrics(memberId: string): Promise<CommissionMetrics> {
  const params = new URLSearchParams();
  if (memberId) params.set("memberId", memberId);
  return commissionFetch(`/api/commission-sales/metrics?${params.toString()}`, emptyMetrics, "Nao foi possivel carregar metricas de comissao");
}

export async function fetchCommissionRanking(): Promise<CommissionRanking> {
  return commissionFetch("/api/commission-sales/ranking", emptyRanking, "Nao foi possivel carregar ranking de comissoes");
}

async function commissionFetch<T>(endpoint: string, emptyValue: T, errorMessage: string): Promise<T> {
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
    return { ...emptyValue, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyValue;
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}
