"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type {
  ClientPriority,
  ClientStatus,
  DocumentType
} from "@/lib/types/clients";

type ClientPayload = {
  name: string;
  phase: string;
  value: number;
  months: number;
  contact: string;
  email: string;
  phone: string;
  document: string;
  documentType: DocumentType | null;
  segment: string;
  status: ClientStatus;
  priority: ClientPriority;
  tags: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  convertedFromLeadId: string | null;
  notes: string;
};

export async function createClientAction(formData: FormData) {
  await mutateClientBackend("/api/clients", "POST", clientPayloadFromForm(formData));
  revalidatePath("/clients");
}

export async function updateClientAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateClientBackend(
    `/api/clients/${encodeURIComponent(id)}`,
    "PUT",
    clientPayloadFromForm(formData)
  );
  revalidatePath("/clients");
}

export async function updateClientPhaseAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  const phase = requiredString(formData.get("phase"));

  await mutateClientBackend(`/api/clients/${encodeURIComponent(id)}/phase`, "PATCH", {
    phase
  });
  revalidatePath("/clients");
}

export async function deleteClientAction(formData: FormData) {
  const id = requiredString(formData.get("id"));
  await mutateClientBackend(`/api/clients/${encodeURIComponent(id)}`, "DELETE");
  revalidatePath("/clients");
}

function clientPayloadFromForm(formData: FormData): ClientPayload {
  return {
    name: requiredString(formData.get("name")),
    phase: requiredString(formData.get("phase")),
    value: numberFromForm(formData.get("value")),
    months: Math.max(1, numberFromForm(formData.get("months"))),
    contact: requiredString(formData.get("contact")),
    email: stringFromForm(formData.get("email")),
    phone: stringFromForm(formData.get("phone")),
    document: stringFromForm(formData.get("document")),
    documentType: nullableString(formData.get("documentType")) as DocumentType | null,
    segment: stringFromForm(formData.get("segment")),
    status: requiredString(formData.get("status")) as ClientStatus,
    priority: requiredString(formData.get("priority")) as ClientPriority,
    tags: stringFromForm(formData.get("tags")),
    addressStreet: stringFromForm(formData.get("addressStreet")),
    addressNumber: stringFromForm(formData.get("addressNumber")),
    addressComplement: stringFromForm(formData.get("addressComplement")),
    addressDistrict: stringFromForm(formData.get("addressDistrict")),
    addressCity: stringFromForm(formData.get("addressCity")),
    addressState: stringFromForm(formData.get("addressState")).toUpperCase(),
    addressZipCode: stringFromForm(formData.get("addressZipCode")),
    convertedFromLeadId: null,
    notes: stringFromForm(formData.get("notes"))
  };
}

async function mutateClientBackend(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
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
    throw new Error(error?.message ?? "Nao foi possivel salvar o cliente");
  }
}

function requiredString(value: FormDataEntryValue | null) {
  const normalizedValue = stringFromForm(value);
  if (!normalizedValue) {
    throw new Error("Campo obrigatorio ausente");
  }
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
