import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { toClientSearchParams } from "@/lib/clients/query";
import type { ClientPage, ClientQuery } from "@/lib/types/clients";

const emptyClientPage: ClientPage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchClients(query: ClientQuery): Promise<ClientPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toClientSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/clients?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return {
      ...emptyClientPage,
      sourceUnavailable: true,
      loadError: "Backend indisponivel em http://localhost:8080."
    };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyClientPage;
  }

  if (!response.ok) {
    return { ...emptyClientPage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar clientes") };
  }

  return response.json();
}
