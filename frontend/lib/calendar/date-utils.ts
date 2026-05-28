import type { CalendarEvent } from "@/lib/types/calendar";

export type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
};

const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export function getWeekdayLabels() {
  return weekdays;
}

export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return startOfMonth(new Date());
  }

  return new Date(year, month - 1, 1);
}

export function buildMonthRange(monthKey: string) {
  const monthStart = parseMonthKey(monthKey);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  return {
    from: toDateKey(monthStart),
    to: toDateKey(monthEnd)
  };
}

export function buildCalendarDays(monthKey: string, events: CalendarEvent[]) {
  const monthStart = parseMonthKey(monthKey);
  const calendarStart = startOfWeek(monthStart);
  const todayKey = toDateKey(new Date());
  const eventsByDate = groupEventsByDate(events);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(calendarStart, index);
    const dateKey = toDateKey(date);

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: dateKey === todayKey,
      events: eventsByDate.get(dateKey) ?? []
    };
  });
}

export function getMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(parseMonthKey(monthKey));
}

export function getAdjacentMonth(monthKey: string, step: number) {
  const date = parseMonthKey(monthKey);
  return toMonthKey(new Date(date.getFullYear(), date.getMonth() + step, 1));
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function groupEventsByDate(events: CalendarEvent[]) {
  return events.reduce((groupedEvents, event) => {
    const dayEvents = groupedEvents.get(event.date) ?? [];
    groupedEvents.set(event.date, [...dayEvents, event]);
    return groupedEvents;
  }, new Map<string, CalendarEvent[]>());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
