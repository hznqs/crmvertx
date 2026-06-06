import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { CalendarEvent } from "@/lib/types/calendar";

type CalendarOverviewProps = {
  events: CalendarEvent[];
  monthLabel: string;
};

export function CalendarOverview({ events, monthLabel }: CalendarOverviewProps) {
  const scheduledEvents = events.filter((event) => event.status === "agendada").length;
  const completedEvents = events.filter((event) => event.status === "executada" || event.status === "realizada").length;
  const canceledEvents = events.filter((event) => event.status === "cancelada").length;
  const overdueEvents = events.filter(isOverdue).length;
  const reminders = events.filter((event) => event.reminderMinutesBefore !== null && event.status === "agendada").length;
  const revenue = events.reduce(
    (total, event) => total + Number(event.revenue ?? 0),
    0
  );

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Reunioes do periodo" value={String(events.length)} helper={monthLabel} />
      <MetricCard
        label="Agendados"
        value={String(scheduledEvents)}
        helper="Reunioes pendentes na agenda"
      />
      <MetricCard
        label="Atrasadas/canceladas"
        value={`${overdueEvents}/${canceledEvents}`}
        helper="Risco operacional da agenda"
      />
      <MetricCard
        label="Receita/lembretes"
        value={formatCurrency(revenue)}
        helper={`${completedEvents} executados · ${reminders} lembretes`}
      />
    </section>
  );
}

function isOverdue(event: CalendarEvent) {
  const time = (event.startTime ?? event.time ?? "23:59").slice(0, 5);
  return event.status === "agendada" && new Date(`${event.date}T${time}:00`).getTime() < Date.now();
}
