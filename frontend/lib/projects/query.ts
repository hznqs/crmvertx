import type { ProjectQuery, ProjectSearchParams } from "@/lib/types/projects";

export function buildProjectQuery(searchParams: ProjectSearchParams): ProjectQuery {
  return {
    search: searchParams.search ?? "",
    clientId: searchParams.clientId ?? "",
    contractId: searchParams.contractId ?? "",
    serviceId: searchParams.serviceId ?? "",
    status: searchParams.status ?? "",
    responsibleUserId: searchParams.responsibleUserId ?? "",
    slaFrom: searchParams.slaFrom ?? "",
    slaTo: searchParams.slaTo ?? "",
    active: searchParams.active ?? "true",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 25), 1), 100)
  };
}

export function toProjectSearchParams(query: ProjectQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
