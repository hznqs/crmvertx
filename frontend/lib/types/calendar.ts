export type CalendarEventType =
  | "REUNIAO"
  | "FOLLOW_UP"
  | "LIGACAO"
  | "ENTREGA"
  | "COBRANCA"
  | "INTERNO";

export type CalendarEventStatus = "agendada" | "executada" | "cancelada";

export type CalendarEvent = {
  id: string;
  clientId: string | null;
  type: CalendarEventType;
  title: string;
  date: string;
  time: string | null;
  status: CalendarEventStatus;
  sale: boolean;
  revenue: number | null;
  notes: string | null;
  active: boolean;
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
};

export type CalendarQuery = {
  month: string;
  status: string;
  type: string;
};

export type CalendarSearchParams = Partial<Record<keyof CalendarQuery, string>>;

export type CalendarClientOption = {
  id: string;
  label: string;
};
