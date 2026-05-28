import type { FinanceQuery, FinanceSearchParams } from "@/lib/types/finance";

export function buildFinanceQuery(searchParams: FinanceSearchParams): FinanceQuery {
  return {
    type: searchParams.type ?? "",
    status: searchParams.status ?? "",
    from: searchParams.from ?? "",
    to: searchParams.to ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 50), 1), 100)
  };
}

export function toFinanceSearchParams(query: FinanceQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
