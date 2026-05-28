import type { DashboardQuery, DashboardSearchParams } from "@/lib/types/dashboard";

export function buildDashboardQuery(searchParams: DashboardSearchParams): DashboardQuery {
  return {
    from: searchParams.from ?? "",
    to: searchParams.to ?? ""
  };
}

export function toDashboardSearchParams(query: DashboardQuery) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  return params;
}
