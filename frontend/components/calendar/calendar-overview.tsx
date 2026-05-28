import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { CalendarEvent } from "@/lib/types/calendar";

type CalendarOverviewProps = {
  events: CalendarEvent[];
  monthLabel: string;
};

export function CalendarOverview({ events, monthLabel }: CalendarOverviewProps) {
  const scheduledEvents = events.filter((event) => event.status === "agendada").length;
  const completedEvents = events.filter((event) => event.status === "executada").length;
  const deliveryEvents = events.filter((event) => event.type === "ENTREGA").length;
  const revenue = events.reduce(
    (total, event) => total + Number(event.revenue ?? 0),
    0
  );

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Eventos do mes" value={String(events.length)} helper={monthLabel} />
      <MetricCard
        label="Agendados"
        value={String(scheduledEvents)}
        helper="Acoes pendentes na agenda"
      />
      <MetricCard
        label="Entregas"
        value={String(deliveryEvents)}
        helper="Compromissos operacionais"
      />
      <MetricCard
        label="Receita vinculada"
        value={formatCurrency(revenue)}
        helper={`${completedEvents} eventos executados`}
      />
    </section>
  );
}
