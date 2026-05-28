import { cookies } from "next/headers";
import { toTaskSearchParams } from "@/lib/tasks/query";
import type { TaskPage, TaskQuery } from "@/lib/types/tasks";

const emptyTaskPage: TaskPage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchTasks(query: TaskQuery): Promise<TaskPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toTaskSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/tasks?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyTaskPage, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyTaskPage;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar tarefas");
  }

  return response.json();
}
