import { cookies } from "next/headers";
import { toContractSearchParams } from "@/lib/contracts/query";
import type { ContractPage, ContractQuery, ContractSummary } from "@/lib/types/contracts";

const emptyContractPage: ContractPage = {
  content: [],
  number: 0,
  size: 50,
  totalPages: 1,
  totalElements: 0
};

const emptySummary: ContractSummary = {
  active: 0,
  expiringSoon: 0,
  autoRenew: 0,
  mrr: 0
};

export async function fetchContracts(query: ContractQuery): Promise<ContractPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toContractSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/contracts?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyContractPage, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyContractPage;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar contratos");
  }

  return response.json();
}

export async function fetchContractSummary(): Promise<ContractSummary> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/contracts/summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptySummary, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptySummary;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar resumo de contratos");
  }

  return response.json();
}
