import type { ContractQuery, ContractSearchParams } from "@/lib/types/contracts";

export function buildContractQuery(searchParams: ContractSearchParams): ContractQuery {
  return {
    status: searchParams.status ?? "",
    clientId: searchParams.clientId ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 50), 1), 100)
  };
}

export function toContractSearchParams(query: ContractQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
