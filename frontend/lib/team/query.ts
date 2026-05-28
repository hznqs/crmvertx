import type { TeamQuery, TeamSearchParams } from "@/lib/types/team";

export function buildTeamQuery(searchParams: TeamSearchParams): TeamQuery {
  return {
    role: searchParams.role ?? "",
    search: searchParams.search ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 50), 1), 100)
  };
}

export function toTeamSearchParams(query: TeamQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
