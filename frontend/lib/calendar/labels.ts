import type {
  CalendarEventStatus,
  CalendarEventType
} from "@/lib/types/calendar";

export const calendarEventTypeLabels: Record<CalendarEventType, string> = {
  REUNIAO: "Reuniao",
  FOLLOW_UP: "Follow-up",
  LIGACAO: "Ligacao",
  ENTREGA: "Entrega",
  COBRANCA: "Cobranca",
  INTERNO: "Interno"
};

export const calendarEventStatusLabels: Record<CalendarEventStatus, string> = {
  agendada: "Agendada",
  executada: "Executada",
  cancelada: "Cancelada"
};

export const calendarEventStatusTone: Record<CalendarEventStatus, string> = {
  agendada: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  executada: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  cancelada: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};
