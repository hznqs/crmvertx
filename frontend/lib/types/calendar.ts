export type CalendarEventType =
  | "REUNIAO"
  | "FOLLOW_UP"
  | "LIGACAO"
  | "ENTREGA"
  | "COBRANCA"
  | "INTERNO"
  | "CHAMADA"
  | "PRESENCIAL"
  | "ONLINE"
  | "APRESENTACAO"
  | "ALINHAMENTO"
  | "FECHAMENTO";

export type CalendarEventStatus = "agendada" | "executada" | "realizada" | "cancelada" | "remarcada";
export type CalendarEventPriority = "baixa" | "media" | "alta" | "critica";
export type CalendarEventRecurrence = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type CalendarEventSource = "event" | "task" | "project";
export type CalendarViewMode = "month" | "week" | "day";

export type CalendarEvent = {
  id: string;
  clientId: string | null;
  leadId: string | null;
  projectId: string | null;
  contractId: string | null;
  taskId: string | null;
  source?: CalendarEventSource;
  sourceLabel?: string;
  type: CalendarEventType;
  title: string;
  date: string;
  endDate: string | null;
  time: string | null;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  status: CalendarEventStatus;
  responsible: string | null;
  meetingLink: string | null;
  meetingUrl: string | null;
  location: string | null;
  priority: CalendarEventPriority;
  color: string | null;
  recurrenceRule: CalendarEventRecurrence | null;
  recurrenceGroupId: string | null;
  participants: string | null;
  reminderMinutesBefore: number | null;
  sale: boolean;
  revenue: number | null;
  description: string | null;
  notes: string | null;
  active: boolean;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEventPage = {
  content: CalendarEvent[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  loadError?: string;
};

export type CalendarQuery = {
  month: string;
  date: string;
  view: CalendarViewMode;
  clientId: string;
  leadId: string;
  projectId: string;
  contractId: string;
  taskId: string;
  responsible: string;
  status: string;
  type: string;
  priority: string;
};

export type CalendarSearchParams = Partial<Record<keyof CalendarQuery, string>>;

export type CalendarClientOption = {
  id: string;
  label: string;
};

export type CalendarRelationOption = {
  id: string;
  label: string;
  description?: string;
};
