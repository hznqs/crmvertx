import { PermissionGate } from "@/components/auth/permission-gate";
import { CalendarAgendaPanel } from "@/components/calendar/calendar-agenda-panel";
import { CalendarCreateButton } from "@/components/calendar/calendar-create-button";
import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarOverview } from "@/components/calendar/calendar-overview";
import { fetchCalendarEvents } from "@/lib/api/calendar";
import { fetchClients } from "@/lib/api/clients";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildCalendarDays, getMonthLabel } from "@/lib/calendar/date-utils";
import { buildCalendarQuery } from "@/lib/calendar/query";
import { buildClientQuery } from "@/lib/clients/query";
import type { CalendarClientOption, CalendarSearchParams } from "@/lib/types/calendar";

type CalendarPageProps = {
  searchParams: Promise<CalendarSearchParams>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "AGENDA");
  const query = buildCalendarQuery(resolvedSearchParams);
  const [eventPage, clientPage] = await Promise.all([
    fetchCalendarEvents(query),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" }))
  ]);
  const calendarDays = buildCalendarDays(query.month, eventPage.content);
  const monthLabel = getMonthLabel(query.month);
  const clientOptions = clientPage.content.map(toClientOption);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Agenda operacional
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Calendario
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Reunioes, follow-ups, entregas e cobrancas organizadas em uma
            grade mensal com agenda lateral para execucao diaria.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CalendarFilters query={query} />
          <PermissionGate module="AGENDA" level="write" role={user?.role ?? null}>
            <CalendarCreateButton clientOptions={clientOptions} />
          </PermissionGate>
        </div>
      </section>

      {eventPage.sourceUnavailable ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          Backend indisponivel em http://localhost:8080. Inicie o Spring Boot
          para carregar a agenda real.
        </div>
      ) : null}

      <CalendarOverview events={eventPage.content} monthLabel={monthLabel} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CalendarGrid days={calendarDays} monthLabel={monthLabel} />
        <CalendarAgendaPanel
          events={eventPage.content}
          clientOptions={clientOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toClientOption(client: { id: string; name: string }): CalendarClientOption {
  return { id: client.id, label: client.name };
}
