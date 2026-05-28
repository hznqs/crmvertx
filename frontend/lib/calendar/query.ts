import { toMonthKey } from "@/lib/calendar/date-utils";
import type { CalendarQuery, CalendarSearchParams } from "@/lib/types/calendar";

export function buildCalendarQuery(searchParams: CalendarSearchParams): CalendarQuery {
  return {
    month: normalizeMonth(searchParams.month),
    status: normalize(searchParams.status),
    type: normalize(searchParams.type)
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
