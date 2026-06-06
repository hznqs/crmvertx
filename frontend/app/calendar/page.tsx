import { PermissionGate } from "@/components/auth/permission-gate";
import { CalendarAgendaPanel } from "@/components/calendar/calendar-agenda-panel";
import { CalendarCreateButton } from "@/components/calendar/calendar-create-button";
import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarOverview } from "@/components/calendar/calendar-overview";
import { fetchCalendarEvents } from "@/lib/api/calendar";
import { fetchClients } from "@/lib/api/clients";
import { fetchContracts } from "@/lib/api/contracts";
import { fetchLeads } from "@/lib/api/leads";
import { fetchProjects } from "@/lib/api/projects";
import { fetchTasks } from "@/lib/api/tasks";
import { getSessionUser } from "@/lib/auth/session";
import { moduleActionPermissions } from "@/lib/auth/permissions";
import { buildCalendarDaysForRange, buildCalendarRange, getCalendarRangeLabel } from "@/lib/calendar/date-utils";
import { buildCalendarQuery } from "@/lib/calendar/query";
import { buildClientQuery } from "@/lib/clients/query";
import { buildContractQuery } from "@/lib/contracts/query";
import { buildLeadQuery } from "@/lib/leads/query";
import { buildProjectQuery } from "@/lib/projects/query";
import { buildTaskQuery } from "@/lib/tasks/query";
import type { CalendarClientOption, CalendarEvent, CalendarRelationOption, CalendarSearchParams } from "@/lib/types/calendar";
import type { Contract } from "@/lib/types/contracts";
import type { Lead } from "@/lib/types/leads";
import type { Project } from "@/lib/types/projects";
import type { Task } from "@/lib/types/tasks";

type CalendarPageProps = {
  searchParams: Promise<CalendarSearchParams>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getSessionUser();
  const actionPermissions = moduleActionPermissions(user?.role ?? null, "AGENDA");
  const query = buildCalendarQuery(resolvedSearchParams);
  const range = buildCalendarRange(query.view, query.date, query.month);
  const [eventPage, clientPage, leadPage, contractPage, projectCalendarPage, taskCalendarPage, projectOptionPage, taskOptionPage] = await Promise.all([
    fetchCalendarEvents(query),
    fetchClients(buildClientQuery({ size: "100", status: "ATIVO" })),
    fetchLeads(buildLeadQuery({ size: "100", status: "ACTIVE" })),
    fetchContracts(buildContractQuery({ size: "100" })),
    fetchProjects(buildProjectQuery({ size: "100", active: "true", slaFrom: range.from, slaTo: range.to })),
    fetchTasks(buildTaskQuery({ size: "100", active: "true", dueFrom: range.from, dueTo: range.to })),
    fetchProjects(buildProjectQuery({ size: "100", active: "true" })),
    fetchTasks(buildTaskQuery({ size: "100", active: "true" }))
  ]);
  const clientOptions = clientPage.content.map(toClientOption);
  const leadOptions = leadPage.content.map(toLeadOption);
  const contractOptions = contractPage.content.map(toContractOption);
  const projectOptions = projectOptionPage.content.map(toProjectOption);
  const taskOptions = taskOptionPage.content.map(toTaskOption);
  const derivedEvents = buildDerivedCalendarEvents(projectCalendarPage.content, taskCalendarPage.content, query);
  const events = [...eventPage.content.map((event) => ({ ...event, source: event.source ?? "event" })), ...derivedEvents];
  const calendarDays = buildCalendarDaysForRange(range.from, range.to, events, query.month);
  const rangeLabel = getCalendarRangeLabel(query.view, range.from, range.to, query.month);
  const loadError = eventPage.loadError ?? clientPage.loadError ?? leadPage.loadError ?? contractPage.loadError ?? projectCalendarPage.loadError ?? taskCalendarPage.loadError ?? projectOptionPage.loadError ?? taskOptionPage.loadError;

  return (
    <main className="space-y-6">
      <section className="flex min-w-0 flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            Agenda operacional
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Calendario
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Reunioes, follow-ups, entregas e cobrancas organizadas por dia,
            semana ou mes com agenda lateral para execucao diaria.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 2xl:flex-row 2xl:items-center">
          <CalendarFilters
            query={query}
            clientOptions={clientOptions}
            leadOptions={leadOptions}
            contractOptions={contractOptions}
            projectOptions={projectOptions}
            taskOptions={taskOptions}
          />
          <PermissionGate module="AGENDA" level="write" role={user?.role ?? null}>
            <CalendarCreateButton
              clientOptions={clientOptions}
              leadOptions={leadOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              taskOptions={taskOptions}
            />
          </PermissionGate>
        </div>
      </section>

      {loadError ? (
        <div className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100">
          {loadError}
        </div>
      ) : null}

      <CalendarOverview events={events} monthLabel={rangeLabel} />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CalendarGrid days={calendarDays} monthLabel={rangeLabel} view={query.view} />
        <CalendarAgendaPanel
          events={events}
          clientOptions={clientOptions}
          leadOptions={leadOptions}
          contractOptions={contractOptions}
          projectOptions={projectOptions}
          taskOptions={taskOptions}
          actionPermissions={actionPermissions}
        />
      </section>
    </main>
  );
}

function toClientOption(client: { id: string; name: string }): CalendarClientOption {
  return { id: client.id, label: client.name };
}

function toLeadOption(lead: Lead): CalendarRelationOption {
  return {
    id: lead.id,
    label: lead.companyName ?? lead.name,
    description: lead.name
  };
}

function toContractOption(contract: Contract): CalendarRelationOption {
  return {
    id: contract.id,
    label: contract.plan,
    description: `${contract.startDate} ate ${contract.endDate}`
  };
}

function toProjectOption(project: Project): CalendarRelationOption {
  return {
    id: project.id,
    label: project.name,
    description: project.status
  };
}

function toTaskOption(task: Task): CalendarRelationOption {
  return {
    id: task.id,
    label: task.title,
    description: task.status
  };
}

function buildDerivedCalendarEvents(projects: Project[], tasks: Task[], query: ReturnType<typeof buildCalendarQuery>): CalendarEvent[] {
  if (query.type || query.status === "cancelada" || query.status === "remarcada") {
    return [];
  }

  const projectEvents = projects
    .filter((project) => project.slaDueDate)
    .filter((project) => !query.clientId || project.clientId === query.clientId)
    .filter((project) => !query.projectId || project.id === query.projectId)
    .filter((project) => !query.contractId || project.contractId === query.contractId)
    .map((project) => ({
      id: `project-${project.id}`,
      clientId: project.clientId,
      leadId: null,
      projectId: project.id,
      contractId: project.contractId,
      taskId: null,
      source: "project" as const,
      sourceLabel: "Projeto",
      type: "INTERNO" as const,
      title: `Prazo do projeto: ${project.name}`,
      date: project.slaDueDate ?? "",
      endDate: project.slaDueDate,
      time: null,
      startTime: null,
      endTime: null,
      allDay: true,
      status: project.status === "FINALIZADO" ? "executada" as const : "agendada" as const,
      responsible: null,
      meetingLink: null,
      meetingUrl: null,
      location: null,
      priority: priorityFromProject(project.priority),
      color: null,
      recurrenceRule: null,
      recurrenceGroupId: null,
      participants: null,
      reminderMinutesBefore: null,
      sale: false,
      revenue: null,
      description: project.description,
      notes: project.description,
      active: project.active,
      cancelledAt: null,
      completedAt: null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

  const taskEvents = tasks
    .filter((task) => !query.clientId || task.clientId === query.clientId)
    .filter((task) => !query.projectId || task.projectId === query.projectId)
    .filter((task) => !query.contractId || task.contractId === query.contractId)
    .filter((task) => !query.taskId || task.id === query.taskId)
    .map((task) => ({
      id: `task-${task.id}`,
      clientId: task.clientId,
      leadId: null,
      projectId: task.projectId,
      contractId: task.contractId,
      taskId: task.id,
      source: "task" as const,
      sourceLabel: "Tarefa",
      type: "ENTREGA" as const,
      title: `Tarefa: ${task.title}`,
      date: task.dueDate,
      endDate: task.dueDate,
      time: null,
      startTime: null,
      endTime: null,
      allDay: true,
      status: task.status === "CONCLUIDA" ? "executada" as const : "agendada" as const,
      responsible: null,
      meetingLink: null,
      meetingUrl: null,
      location: null,
      priority: priorityFromTask(task.priority),
      color: null,
      recurrenceRule: null,
      recurrenceGroupId: null,
      participants: null,
      reminderMinutesBefore: null,
      sale: false,
      revenue: null,
      description: task.description,
      notes: task.comments ?? task.description,
      active: task.active,
      cancelledAt: null,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

  return [...projectEvents, ...taskEvents].filter((event) => {
    if (query.priority && event.priority !== query.priority) return false;
    return true;
  });
}

function priorityFromTask(priority: Task["priority"]): CalendarEvent["priority"] {
  if (priority === "BAIXA") return "baixa";
  if (priority === "ALTA") return "alta";
  if (priority === "CRITICA") return "critica";
  return "media";
}

function priorityFromProject(priority: Project["priority"]): CalendarEvent["priority"] {
  if (priority === "BAIXA") return "baixa";
  if (priority === "ALTA" || priority === "URGENTE") return "alta";
  return "media";
}
