import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { buildCalendarRange } from "@/lib/calendar/date-utils";
import type { CalendarEventPage, CalendarQuery } from "@/lib/types/calendar";

const emptyEventPage: CalendarEventPage = {
  content: [],
  number: 0,
  size: 100,
  totalPages: 1,
  totalElements: 0
};

export async function fetchCalendarEvents(query: CalendarQuery): Promise<CalendarEventPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const { from, to } = buildCalendarRange(query.view, query.date, query.month);
  const params = new URLSearchParams({
    from,
    to,
    page: "0",
    size: "100"
  });

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.type) {
    params.set("type", query.type);
  }

  if (query.clientId) {
    params.set("clientId", query.clientId);
  }

  if (query.leadId) {
    params.set("leadId", query.leadId);
  }

  if (query.projectId) {
    params.set("projectId", query.projectId);
  }

  if (query.contractId) {
    params.set("contractId", query.contractId);
  }

  if (query.taskId) {
    params.set("taskId", query.taskId);
  }

  if (query.responsible) {
    params.set("responsible", query.responsible);
  }

  if (query.priority) {
    params.set("priority", query.priority);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/events?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return {
      ...emptyEventPage,
      sourceUnavailable: true,
      loadError: "Backend indisponivel em http://localhost:8080."
    };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyEventPage;
  }

  if (!response.ok) {
    return { ...emptyEventPage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar agenda") };
  }

  return (await response.json()) as CalendarEventPage;
}
