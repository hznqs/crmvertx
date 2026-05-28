import type { CommissionQuery, CommissionSearchParams } from "@/lib/types/commissions";

export function buildCommissionQuery(searchParams: CommissionSearchParams): CommissionQuery {
  return {
    memberId: searchParams.memberId ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 50), 1), 100)
  };
}

export function toCommissionSearchParams(query: CommissionQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
