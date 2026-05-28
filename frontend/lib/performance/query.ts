import type { PerformanceQuery, PerformanceSearchParams } from "@/lib/types/performance";

export function buildPerformanceQuery(searchParams: PerformanceSearchParams): PerformanceQuery {
  return {
    clientId: searchParams.clientId ?? "",
    from: searchParams.from ?? "",
    to: searchParams.to ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 50), 1), 100)
  };
}

export function toPerformanceSearchParams(query: PerformanceQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
