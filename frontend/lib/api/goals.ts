import { cookies } from "next/headers";
import { toGoalSearchParams } from "@/lib/goals/query";
import type { GoalPage, GoalQuery } from "@/lib/types/goals";

const emptyGoalPage: GoalPage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchGoals(query: GoalQuery): Promise<GoalPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toGoalSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/goals?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return {
      ...emptyGoalPage,
      sourceUnavailable: true,
      loadError: "Backend indisponivel em http://localhost:8080."
    };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyGoalPage;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = typeof error?.message === "string"
      ? error.message
      : "Nao foi possivel carregar metas agora.";
    return { ...emptyGoalPage, loadError: message };
  }

  return response.json();
}
