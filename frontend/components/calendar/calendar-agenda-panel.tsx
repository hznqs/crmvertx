import { calendarEventPriorityLabels, calendarEventPriorityTone, calendarEventStatusLabels, calendarEventTypeLabels } from "@/lib/calendar/labels";
import { CalendarEventActions } from "@/components/calendar/calendar-event-actions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { CalendarClientOption, CalendarEvent, CalendarRelationOption } from "@/lib/types/calendar";

type CalendarAgendaPanelProps = {
  events: CalendarEvent[];
  clientOptions: CalendarClientOption[];
  leadOptions: CalendarRelationOption[];
  contractOptions: CalendarRelationOption[];
  projectOptions: CalendarRelationOption[];
  taskOptions: CalendarRelationOption[];
  actionPermissions: ModuleActionPermissions;
};

export function CalendarAgendaPanel({
  events,
  clientOptions,
  leadOptions,
  contractOptions,
  projectOptions,
  taskOptions,
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
              leadOptions={leadOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              taskOptions={taskOptions}
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
  leadOptions,
  contractOptions,
  projectOptions,
  taskOptions,
  actionPermissions
}: {
  event: CalendarEvent;
  clientOptions: CalendarClientOption[];
  leadOptions: CalendarRelationOption[];
  contractOptions: CalendarRelationOption[];
  projectOptions: CalendarRelationOption[];
  taskOptions: CalendarRelationOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const clientName = clientOptions.find((client) => client.id === event.clientId)?.label;
  const leadName = leadOptions.find((lead) => lead.id === event.leadId)?.label;
  const contractName = contractOptions.find((contract) => contract.id === event.contractId)?.label;
  const projectName = projectOptions.find((project) => project.id === event.projectId)?.label;
  const taskName = taskOptions.find((task) => task.id === event.taskId)?.label;
  const statusLabel = isOverdue(event) ? "Atrasada" : calendarEventStatusLabels[event.status];
  const sourceLabel = event.sourceLabel ?? "Agenda";

  return (
    <article id={`event-${event.id}`} className={`scroll-mt-24 rounded-xl p-4 transition hover:bg-white/[0.07] ${eventSurface(event)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{event.title}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatDate(event.date)} · {timeRange(event)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-brand-500/15 px-2.5 py-1 text-[0.68rem] font-bold text-fuchsia-100">
            {statusLabel}
          </span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-zinc-400">
            {sourceLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
          {calendarEventTypeLabels[event.type]}
        </span>
        <span className={`rounded-full px-2.5 py-1 ring-1 ${calendarEventPriorityTone[event.priority]}`}>
          {calendarEventPriorityLabels[event.priority]}
        </span>
        {clientName ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            {clientName}
          </span>
        ) : null}
        {event.responsible ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            Resp. {event.responsible}
          </span>
        ) : null}
        {leadName ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            Lead: {leadName}
          </span>
        ) : null}
        {contractName ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            Contrato: {contractName}
          </span>
        ) : null}
        {projectName ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            Projeto: {projectName}
          </span>
        ) : null}
        {taskName ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            Tarefa: {taskName}
          </span>
        ) : null}
        {event.reminderMinutesBefore !== null ? (
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1">
            Lembrete {reminderLabel(event.reminderMinutesBefore)}
          </span>
        ) : null}
        {event.sale ? (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-200">
            Venda · {formatCurrency(event.revenue)}
          </span>
        ) : null}
      </div>

      {event.meetingLink || event.meetingUrl || event.location ? (
        <div className="mt-3 grid gap-2 text-xs text-zinc-400">
          {event.meetingLink || event.meetingUrl ? <a href={event.meetingUrl ?? event.meetingLink ?? ""} target="_blank" rel="noreferrer" className="truncate text-brand-400 hover:text-fuchsia-200">{event.meetingUrl ?? event.meetingLink}</a> : null}
          {event.location ? <span className="truncate">Local: {event.location}</span> : null}
        </div>
      ) : null}

      {event.description || event.notes ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{event.description ?? event.notes}</p>
      ) : null}

      <CalendarEventActions
        event={event}
        clientOptions={clientOptions}
        leadOptions={leadOptions}
        contractOptions={contractOptions}
        projectOptions={projectOptions}
        taskOptions={taskOptions}
        actionPermissions={actionPermissions}
      />
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
  if (event.status === "cancelada") return "bg-rose-500/10 ring-1 ring-rose-400/20";
  if (isOverdue(event)) return "bg-amber-500/10 ring-1 ring-amber-400/20";
  if (isUpcoming(event)) return "bg-brand-500/10 ring-1 ring-brand-400/20 shadow-[0_0_24px_rgba(234,89,220,.10)]";
  return "bg-white/[0.045]";
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

function reminderLabel(minutes: number) {
  if (minutes === 0) return "no horario";
  if (minutes < 60) return `${minutes} min antes`;
  if (minutes === 60) return "1h antes";
  if (minutes === 1440) return "1 dia antes";
  return `${minutes} min antes`;
}
