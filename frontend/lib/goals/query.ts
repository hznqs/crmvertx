import type { GoalQuery, GoalSearchParams } from "@/lib/types/goals";

export function buildGoalQuery(searchParams: GoalSearchParams): GoalQuery {
  return {
    from: searchParams.from ?? "",
    to: searchParams.to ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 25), 1), 100)
  };
}

export function toGoalSearchParams(query: GoalQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
