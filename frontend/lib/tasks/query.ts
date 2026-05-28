import type { TaskQuery, TaskSearchParams } from "@/lib/types/tasks";

export function buildTaskQuery(searchParams: TaskSearchParams): TaskQuery {
  return {
    search: searchParams.search ?? "",
    projectId: searchParams.projectId ?? "",
    deliveryId: searchParams.deliveryId ?? "",
    responsibleUserId: searchParams.responsibleUserId ?? "",
    priority: searchParams.priority ?? "",
    status: searchParams.status ?? "",
    dueFrom: searchParams.dueFrom ?? "",
    dueTo: searchParams.dueTo ?? "",
    active: searchParams.active ?? "true",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 25), 1), 100)
  };
}

export function toTaskSearchParams(query: TaskQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
