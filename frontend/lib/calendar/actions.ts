"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { safeServerAction, type ServerActionResult } from "@/lib/actions/result";
import { numberFromFormValue } from "@/lib/forms/number";
import type {
  CalendarEventPriority,
  CalendarEventRecurrence,
  CalendarEventStatus,
  CalendarEventType
} from "@/lib/types/calendar";

type CalendarEventPayload = {
  clientId: string | null;
  leadId: string | null;
  projectId: string | null;
  contractId: string | null;
  taskId: string | null;
  type: CalendarEventType;
  title: string;
  date: string;
  endDate: string | null;
  time: string | null;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  status: CalendarEventStatus;
  responsible: string;
  meetingLink: string | null;
  meetingUrl: string | null;
  location: string | null;
  priority: CalendarEventPriority;
  color: string | null;
  recurrenceRule: CalendarEventRecurrence;
  participants: string;
  reminderMinutesBefore: number;
  sale: boolean;
  revenue: number;
  description: string;
  notes: string;
  active: boolean;
};

export async function createCalendarEventAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    await mutateCalendarBackend("/api/events", "POST", eventPayloadFromForm(formData));
    revalidatePath("/calendar");
  }, "Nao foi possivel salvar o evento");
}

export async function updateCalendarEventAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateCalendarBackend(`/api/events/${encodeURIComponent(id)}`, "PUT", eventPayloadFromForm(formData));
    revalidatePath("/calendar");
  }, "Nao foi possivel salvar o evento");
}

export async function deleteCalendarEventAction(formData: FormData): Promise<ServerActionResult> {
  return safeServerAction(async () => {
    const id = requiredString(formData.get("id"));
    await mutateCalendarBackend(`/api/events/${encodeURIComponent(id)}`, "DELETE");
    revalidatePath("/calendar");
  }, "Nao foi possivel cancelar o evento");
}

function eventPayloadFromForm(formData: FormData): CalendarEventPayload {
  return {
    clientId: nullableString(formData.get("clientId")),
    leadId: nullableString(formData.get("leadId")),
    projectId: nullableString(formData.get("projectId")),
    contractId: nullableString(formData.get("contractId")),
    taskId: nullableString(formData.get("taskId")),
    type: requiredString(formData.get("type")) as CalendarEventType,
    title: requiredString(formData.get("title")),
    date: requiredString(formData.get("date")),
    endDate: nullableString(formData.get("endDate")),
    time: nullableString(formData.get("startTime")),
    startTime: nullableString(formData.get("startTime")),
    endTime: nullableString(formData.get("endTime")),
    allDay: formData.get("allDay") === "true",
    status: requiredString(formData.get("status")) as CalendarEventStatus,
    responsible: stringFromForm(formData.get("responsible")),
    meetingLink: nullableString(formData.get("meetingLink")),
    meetingUrl: nullableString(formData.get("meetingUrl")),
    location: nullableString(formData.get("location")),
    priority: (stringFromForm(formData.get("priority")) || "media") as CalendarEventPriority,
    color: nullableString(formData.get("color")),
    recurrenceRule: (stringFromForm(formData.get("recurrenceRule")) || "NONE") as CalendarEventRecurrence,
    participants: stringFromForm(formData.get("participants")),
    reminderMinutesBefore: numberFromForm(formData.get("reminderMinutesBefore")) || 15,
    sale: formData.get("sale") === "true",
    revenue: numberFromForm(formData.get("revenue")),
    description: stringFromForm(formData.get("description")),
    notes: stringFromForm(formData.get("notes")),
    active: formData.get("active") !== "false"
  };
}

async function mutateCalendarBackend(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE",
  payload?: Record<string, unknown>
) {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    method,
    headers: {
      ...(payload ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: payload ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Nao foi possivel salvar o evento");
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  if (!normalizedValue) throw new Error("Campo obrigatorio ausente");
  return normalizedValue;
}

function nullableString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  return normalizedValue || null;
}

function stringFromForm(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberFromForm(value: FormDataEntryValue | null) {
  return numberFromFormValue(value);
}
