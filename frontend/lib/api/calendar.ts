import { cookies } from "next/headers";
import { buildMonthRange } from "@/lib/calendar/date-utils";
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
  const { from, to } = buildMonthRange(query.month);
  const params = new URLSearchParams({
    from,
    to,
    page: "0",
    size: "100"
  });

  if (query.status) {
    params.set("status", query.status);
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
      sourceUnavailable: true
    };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyEventPage;
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar agenda");
  }

  const eventPage = (await response.json()) as CalendarEventPage;
  const content = query.type
    ? eventPage.content.filter((event) => event.type === query.type)
    : eventPage.content;

  return {
    ...eventPage,
    content,
    totalElements: content.length
  };
}
