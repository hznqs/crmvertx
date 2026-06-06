import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { toTeamSearchParams } from "@/lib/team/query";
import type { TeamPage, TeamQuery, TeamSummary } from "@/lib/types/team";

const emptyTeamPage: TeamPage = {
  content: [],
  number: 0,
  size: 50,
  totalPages: 1,
  totalElements: 0
};

const emptyTeamSummary: TeamSummary = {
  total: 0,
  tasks: 0,
  completed: 0,
  productivity: 0,
  marketing: 0,
  traffic: 0,
  sdr: 0,
  closer: 0,
  developer: 0
};

export async function fetchTeamMembers(query: TeamQuery): Promise<TeamPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toTeamSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/team-members?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyTeamPage, sourceUnavailable: true, loadError: "Backend indisponivel em http://localhost:8080." };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyTeamPage;
  }

  if (!response.ok) {
    return { ...emptyTeamPage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar equipe") };
  }

  return response.json();
}

export async function fetchTeamSummary(query: Pick<TeamQuery, "role" | "search">): Promise<TeamSummary> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = new URLSearchParams();
  if (query.role) params.set("role", query.role);
  if (query.search) params.set("search", query.search);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/team-members/summary?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyTeamSummary, sourceUnavailable: true, loadError: "Backend indisponivel em http://localhost:8080." };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyTeamSummary;
  }

  if (!response.ok) {
    return { ...emptyTeamSummary, loadError: await backendErrorMessage(response, "Nao foi possivel carregar resumo da equipe") };
  }

  return response.json();
}
