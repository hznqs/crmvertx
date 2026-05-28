import { cookies } from "next/headers";
import { toServiceSearchParams } from "@/lib/services/query";
import type { ServicePage, ServiceQuery } from "@/lib/types/services";

const emptyServicePage: ServicePage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchServices(query: ServiceQuery): Promise<ServicePage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toServiceSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/services?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyServicePage, sourceUnavailable: true };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyServicePage;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar servicos");
  }

  return response.json();
}
