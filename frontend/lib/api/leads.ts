import { cookies } from "next/headers";
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
      sourceUnavailable: true
    };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyLeadPage;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar leads");
  }

  return response.json();
}
