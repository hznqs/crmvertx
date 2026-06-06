import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { toPerformanceSearchParams } from "@/lib/performance/query";
import type { PerformancePage, PerformanceQuery } from "@/lib/types/performance";

const emptyPerformancePage: PerformancePage = {
  content: [],
  number: 0,
  size: 50,
  totalPages: 1,
  totalElements: 0
};

export async function fetchPerformanceRecords(query: PerformanceQuery): Promise<PerformancePage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toPerformanceSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/performance-records?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyPerformancePage, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyPerformancePage;
  }

  if (!response.ok) {
    return { ...emptyPerformancePage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar performance") };
  }

  return response.json();
}
