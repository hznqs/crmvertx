import { cookies } from "next/headers";
import type { BillingSummary } from "@/lib/types/billing";

const emptyBillingSummary: BillingSummary = {
  totalRevenue: 0,
  averageTicket: 0,
  activeContracts: 0,
  clients: []
};

export async function fetchBillingSummary(): Promise<BillingSummary> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/billing/summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyBillingSummary, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyBillingSummary;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar resumo de faturamento");
  }

  return response.json();
}
