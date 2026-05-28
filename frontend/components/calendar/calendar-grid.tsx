import { getWeekdayLabels } from "@/lib/calendar/date-utils";
import { calendarEventTypeLabels } from "@/lib/calendar/labels";
import type { CalendarDay } from "@/lib/calendar/date-utils";

type CalendarGridProps = {
  days: CalendarDay[];
  monthLabel: string;
};

export function CalendarGrid({ days, monthLabel }: CalendarGridProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-panel/95 shadow-panel">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Visao mensal
          </p>
          <h2 className="mt-1 text-xl font-bold capitalize text-white">{monthLabel}</h2>
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

      <div className="grid grid-cols-7 border-b border-line bg-white/[0.025]">
        {getWeekdayLabels().map((weekday) => (
          <div
            key={weekday}
            className="px-3 py-3 text-center text-[0.72rem] font-bold uppercase tracking-[0.16em] text-zinc-500"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7">
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
        "min-h-32 border-b border-line p-3 transition md:border-r",
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
          <div
            key={event.id}
            className="rounded-lg bg-white/[0.055] px-2 py-2 text-xs text-zinc-200"
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  event.type === "ENTREGA" ? "bg-emerald-400" : "bg-brand-400"
                ].join(" ")}
              />
              <span className="truncate font-semibold">{event.title}</span>
            </div>
            <p className="mt-1 truncate text-[0.68rem] text-zinc-500">
              {event.time?.slice(0, 5) ?? "Dia todo"} · {calendarEventTypeLabels[event.type]}
            </p>
          </div>
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
