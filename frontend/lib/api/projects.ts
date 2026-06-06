import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { toProjectSearchParams } from "@/lib/projects/query";
import type { ProjectPage, ProjectQuery } from "@/lib/types/projects";

const emptyProjectPage: ProjectPage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchProjects(query: ProjectQuery): Promise<ProjectPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toProjectSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/projects?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyProjectPage, sourceUnavailable: true, loadError: "Backend indisponivel em http://localhost:8080." };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyProjectPage;
  }

  if (!response.ok) {
    return { ...emptyProjectPage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar projetos") };
  }

  return response.json();
}
