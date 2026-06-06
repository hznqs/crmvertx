import { getWeekdayLabels } from "@/lib/calendar/date-utils";
import { calendarEventTypeLabels } from "@/lib/calendar/labels";
import type { CalendarDay } from "@/lib/calendar/date-utils";
import type { CalendarEvent, CalendarViewMode } from "@/lib/types/calendar";

type CalendarGridProps = {
  days: CalendarDay[];
  monthLabel: string;
  view: CalendarViewMode;
};

export function CalendarGrid({ days, monthLabel, view }: CalendarGridProps) {
  const gridClassName = view === "day" ? "grid grid-cols-1" : "grid grid-cols-1 md:grid-cols-7";
  const weekdayLabels = view === "day" ? [formatWeekday(days[0]?.date)] : getWeekdayLabels();
  const weekdayGridClassName = view === "day" ? "grid grid-cols-1" : "grid grid-cols-7";
  const viewLabel = view === "day" ? "Visao diaria" : view === "week" ? "Visao semanal" : "Visao mensal";

  return (
    <section className="overflow-hidden rounded-2xl bg-panel/95 shadow-panel">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            {viewLabel}
          </p>
          <h2 className="mt-1 truncate text-xl font-bold capitalize text-white">{monthLabel}</h2>
        </div>
        <div className="hidden items-center gap-3 text-xs text-zinc-500 md:flex">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-400" /> Comercial
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Operacional
          </span>
        </div>
      </header>

      <div className={`${weekdayGridClassName} border-b border-line bg-white/[0.025]`}>
        {weekdayLabels.map((weekday) => (
          <div
            key={weekday}
            className="px-3 py-3 text-center text-[0.72rem] font-bold uppercase tracking-[0.16em] text-zinc-500"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className={gridClassName}>
        {days.map((day) => (
          <CalendarCell key={day.dateKey} day={day} />
        ))}
      </div>
    </section>
  );
}

function CalendarCell({ day }: { day: CalendarDay }) {
  const visibleEvents = day.events.slice(0, 3);
  const hiddenEvents = Math.max(day.events.length - visibleEvents.length, 0);

  return (
    <article
      className={[
        "min-w-0 min-h-32 border-b border-line p-3 transition md:border-r",
        day.isCurrentMonth ? "bg-white/[0.018]" : "bg-black/18 text-zinc-600",
        day.isToday ? "bg-brand-600/10 ring-1 ring-inset ring-brand-400/50" : "",
        "hover:bg-white/[0.045]"
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
            day.isToday ? "bg-brand-500 text-white" : "text-zinc-300"
          ].join(" ")}
        >
          {day.dayNumber}
        </span>
        {day.events.length ? (
          <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[0.68rem] font-bold text-zinc-300">
            {day.events.length}
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        {visibleEvents.map((event) => (
          <a
            key={event.id}
            href={`#event-${event.id}`}
            className={[
              "block rounded-lg px-2 py-2 text-xs text-zinc-200 transition hover:translate-y-[-1px]",
              eventSurface(event)
            ].join(" ")}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  eventDot(event)
                ].join(" ")}
              />
              <span className="min-w-0 truncate font-semibold">{event.title}</span>
            </div>
            <p className="mt-1 truncate text-[0.68rem] text-zinc-500">
              {timeRange(event)} · {calendarEventTypeLabels[event.type]}
            </p>
          </a>
        ))}

        {hiddenEvents > 0 ? (
          <p className="text-xs font-semibold text-brand-400">
            +{hiddenEvents} eventos
          </p>
        ) : null}
      </div>
    </article>
  );
}

function timeRange(event: CalendarEvent) {
  const start = (event.startTime ?? event.time)?.slice(0, 5);
  const end = event.endTime?.slice(0, 5);
  if (start && end) return `${start}-${end}`;
  return start ?? "Dia todo";
}

function eventSurface(event: CalendarEvent) {
  if (event.status === "cancelada") return "bg-rose-500/10 text-rose-100 ring-1 ring-rose-400/20";
  if (isOverdue(event)) return "bg-amber-500/10 text-amber-100 ring-1 ring-amber-400/20";
  if (isUpcoming(event)) return "bg-brand-500/15 ring-1 ring-brand-400/25 shadow-[0_0_24px_rgba(234,89,220,.12)]";
  return "bg-white/[0.055] hover:bg-white/[0.08]";
}

function eventDot(event: CalendarEvent) {
  if (event.status === "cancelada") return "bg-rose-400";
  if (isOverdue(event)) return "bg-amber-400";
  if (event.type === "ENTREGA") return "bg-emerald-400";
  return "bg-brand-400";
}

function eventDateTime(event: CalendarEvent) {
  return new Date(`${event.date}T${(event.startTime ?? event.time ?? "23:59").slice(0, 5)}:00`);
}

function isOverdue(event: CalendarEvent) {
  return event.status === "agendada" && eventDateTime(event).getTime() < Date.now();
}

function isUpcoming(event: CalendarEvent) {
  const diff = eventDateTime(event).getTime() - Date.now();
  return event.status === "agendada" && diff >= 0 && diff <= 86_400_000;
}

function formatWeekday(date?: Date) {
  if (!date) return "Dia";
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date);
}
