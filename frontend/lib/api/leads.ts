import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { toLeadSearchParams } from "@/lib/leads/query";
import type { LeadPage, LeadQuery } from "@/lib/types/leads";

const emptyLeadPage: LeadPage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchLeads(query: LeadQuery): Promise<LeadPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toLeadSearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/leads?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return {
      ...emptyLeadPage,
      sourceUnavailable: true,
      loadError: "Backend indisponivel em http://localhost:8080."
    };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyLeadPage;
  }

  if (!response.ok) {
    return { ...emptyLeadPage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar leads") };
  }

  return sanitizeLeadPage(await response.json(), query);
}

function sanitizeLeadPage(page: LeadPage, query: LeadQuery): LeadPage {
  if (query.active === "false") {
    return page;
  }

  const content = page.content.filter((lead) => lead.active !== false && lead.status !== "CONVERTED" && !lead.convertedClientId);
  const removed = page.content.length - content.length;
  const totalElements = Math.max(0, page.totalElements - removed);
  const size = page.size > 0 ? page.size : emptyLeadPage.size;
  return {
    ...page,
    content,
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / size))
  };
}
