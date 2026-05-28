"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { CalendarEventStatus, CalendarEventType } from "@/lib/types/calendar";

type CalendarEventPayload = {
  clientId: string | null;
  type: CalendarEventType;
  title: string;
  date: string;
  time: string | null;
  status: CalendarEventStatus;
  sale: boolean;
  revenue: number;
  notes: string;
  active: boolean;
};

export async function createCalendarEventAction(formData: FormData) {
  await mutateCalendarBackend("/api/events", "POST", eventPayloadFromForm(formData));
  revalidatePath("/calendar");
}

export async function updateCalendarEventAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateCalendarBackend(`/api/events/${encodeURIComponent(id)}`, "PUT", eventPayloadFromForm(formData));
  revalidatePath("/calendar");
}

export async function deleteCalendarEventAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateCalendarBackend(`/api/events/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/calendar");
}

function eventPayloadFromForm(formData: FormData): CalendarEventPayload {
  return {
    clientId: nullableString(formData.get("clientId")),
    type: requiredString(formData.get("type")) as CalendarEventType,
    title: requiredString(formData.get("title")),
    date: requiredString(formData.get("date")),
    time: nullableString(formData.get("time")),
    status: requiredString(formData.get("status")) as CalendarEventStatus,
    sale: formData.get("sale") === "true",
    revenue: numberFromForm(formData.get("revenue")),
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
  return Number(String(value ?? "0").replace(/\./g, "").replace(",", ".")) || 0;
}
