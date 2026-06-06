import { toDateKey, toMonthKey } from "@/lib/calendar/date-utils";
import type { CalendarQuery, CalendarSearchParams } from "@/lib/types/calendar";

export function buildCalendarQuery(searchParams: CalendarSearchParams): CalendarQuery {
  return {
    month: normalizeMonth(searchParams.month),
    date: normalizeDate(searchParams.date),
    view: normalizeView(searchParams.view),
    clientId: normalize(searchParams.clientId),
    leadId: normalize(searchParams.leadId),
    projectId: normalize(searchParams.projectId),
    contractId: normalize(searchParams.contractId),
    taskId: normalize(searchParams.taskId),
    responsible: normalize(searchParams.responsible),
    status: normalize(searchParams.status),
    type: normalize(searchParams.type),
    priority: normalize(searchParams.priority)
  };
}

export function toCalendarSearchParams(query: CalendarQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params;
}

function normalize(value: string | undefined) {
  return String(value ?? "").trim();
}

function normalizeMonth(value: string | undefined) {
  const normalizedValue = normalize(value);
  return /^\d{4}-\d{2}$/.test(normalizedValue)
    ? normalizedValue
    : toMonthKey(new Date());
}

function normalizeDate(value: string | undefined) {
  const normalizedValue = normalize(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)
    ? normalizedValue
    : toDateKey(new Date());
}

function normalizeView(value: string | undefined): CalendarQuery["view"] {
  return value === "day" || value === "week" || value === "month" ? value : "month";
}
