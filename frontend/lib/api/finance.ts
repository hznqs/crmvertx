import { cookies } from "next/headers";
import { toFinanceSearchParams } from "@/lib/finance/query";
import type { FinanceEntryPage, FinanceQuery, FinanceSummary } from "@/lib/types/finance";

const emptyFinancePage: FinanceEntryPage = {
  content: [],
  number: 0,
  size: 50,
  totalPages: 1,
  totalElements: 0
};

const emptyFinanceSummary: FinanceSummary = {
  recurringRevenue: 0,
  forecast: 0,
  netProfit: 0,
  margin: 0,
  overdue: 0,
  autoBillingCount: 0,
  commissions: 0,
  taxes: 0,
  grossRevenue: 0,
  expenses: 0
};

export async function fetchFinanceEntries(query: FinanceQuery): Promise<FinanceEntryPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toFinanceSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/finance-entries?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyFinancePage, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyFinancePage;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar financeiro");
  }

  return response.json();
}

export async function fetchFinanceSummary(query: Pick<FinanceQuery, "from" | "to">): Promise<FinanceSummary> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/finance-entries/summary?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyFinanceSummary, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyFinanceSummary;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar resumo financeiro");
  }

  return response.json();
}
