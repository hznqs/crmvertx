import type {
  CalendarEventPriority,
  CalendarEventRecurrence,
  CalendarEventStatus,
  CalendarEventType
} from "@/lib/types/calendar";

export const calendarEventTypeLabels: Record<CalendarEventType, string> = {
  REUNIAO: "Reuniao",
  FOLLOW_UP: "Follow-up",
  LIGACAO: "Ligacao",
  ENTREGA: "Entrega",
  COBRANCA: "Cobranca",
  INTERNO: "Interno",
  CHAMADA: "Chamada",
  PRESENCIAL: "Presencial",
  ONLINE: "Online",
  APRESENTACAO: "Apresentacao",
  ALINHAMENTO: "Alinhamento",
  FECHAMENTO: "Fechamento"
};

export const calendarEventStatusLabels: Record<CalendarEventStatus, string> = {
  agendada: "Agendada",
  executada: "Executada",
  realizada: "Realizada",
  remarcada: "Remarcada",
  cancelada: "Cancelada"
};

export const calendarEventStatusTone: Record<CalendarEventStatus, string> = {
  agendada: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  executada: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  realizada: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  remarcada: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  cancelada: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};

export const calendarEventPriorityLabels: Record<CalendarEventPriority, string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
  critica: "Critica"
};

export const calendarEventPriorityTone: Record<CalendarEventPriority, string> = {
  baixa: "bg-emerald-500/12 text-emerald-100 ring-emerald-500/20",
  media: "bg-sky-500/12 text-sky-100 ring-sky-500/20",
  alta: "bg-amber-500/12 text-amber-100 ring-amber-500/20",
  critica: "bg-rose-500/12 text-rose-100 ring-rose-500/20"
};

export const calendarEventRecurrenceLabels: Record<CalendarEventRecurrence, string> = {
  NONE: "Nao repetir",
  DAILY: "Diariamente",
  WEEKLY: "Semanalmente",
  MONTHLY: "Mensalmente",
  YEARLY: "Anualmente"
};
