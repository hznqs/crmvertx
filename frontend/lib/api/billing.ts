import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import type { BillingSummary } from "@/lib/types/billing";

const emptyBillingSummary: BillingSummary = {
  totalRevenue: 0,
  mrr: 0,
  averageTicket: 0,
  pendingRevenue: 0,
  receivedRevenue: 0,
  overdueRevenue: 0,
  activeContracts: 0,
  clients: []
};

export async function fetchBillingSummary(query?: { from?: string; to?: string }): Promise<BillingSummary> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  const url = new URL(`${apiBaseUrl}/api/billing/summary`);
  if (query?.from) url.searchParams.append("from", query.from);
  if (query?.to) url.searchParams.append("to", query.to);

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyBillingSummary, sourceUnavailable: true, loadError: "Backend indisponivel em http://localhost:8080." };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyBillingSummary;
  }

  if (!response.ok) {
    return { ...emptyBillingSummary, loadError: await backendErrorMessage(response, "Nao foi possivel carregar resumo de faturamento") };
  }

  return response.json();
}
