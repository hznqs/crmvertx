import { calendarEventStatusLabels, calendarEventTypeLabels } from "@/lib/calendar/labels";
import { CalendarEventActions } from "@/components/calendar/calendar-event-actions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { CalendarClientOption, CalendarEvent } from "@/lib/types/calendar";

type CalendarAgendaPanelProps = {
  events: CalendarEvent[];
  clientOptions: CalendarClientOption[];
  actionPermissions: ModuleActionPermissions;
};

export function CalendarAgendaPanel({
  events,
  clientOptions,
  actionPermissions
}: CalendarAgendaPanelProps) {
  const orderedEvents = [...events].sort((firstEvent, secondEvent) => {
    const firstDate = `${firstEvent.date}T${firstEvent.time ?? "23:59"}`;
    const secondDate = `${secondEvent.date}T${secondEvent.time ?? "23:59"}`;
    return firstDate.localeCompare(secondDate);
  });

  return (
    <aside className="rounded-2xl bg-panel/95 shadow-panel">
      <header className="border-b border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Proximos eventos
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">Agenda do mes</h2>
      </header>

      <div className="calendar-scrollbar max-h-[720px] space-y-3 overflow-y-auto p-4">
        {orderedEvents.length ? (
          orderedEvents.map((event) => (
            <AgendaItem
              key={event.id}
              event={event}
              clientOptions={clientOptions}
              actionPermissions={actionPermissions}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-4 py-10 text-center">
            <p className="font-semibold text-white">Sem eventos neste filtro</p>
            <p className="mt-2 text-sm text-muted">
              Reunioes, follow-ups e entregas aparecerao aqui.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function AgendaItem({
  event,
  clientOptions,
  actionPermissions
}: {
  event: CalendarEvent;
  clientOptions: CalendarClientOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  return (
    <article className="rounded-xl bg-white/[0.045] p-4 transition hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{event.title}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatDate(event.date)} · {event.time?.slice(0, 5) ?? "Dia todo"}
          </p>
        </div>
        <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[0.68rem] font-bold text-fuchsia-100">
          {calendarEventStatusLabels[event.status]}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
          {calendarEventTypeLabels[event.type]}
        </span>
        {event.sale ? (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-200">
            Venda · {formatCurrency(event.revenue)}
          </span>
        ) : null}
      </div>

      {event.notes ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{event.notes}</p>
      ) : null}

      <CalendarEventActions
        event={event}
        clientOptions={clientOptions}
        actionPermissions={actionPermissions}
      />
    </article>
  );
}
