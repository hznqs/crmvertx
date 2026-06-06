import { cookies } from "next/headers";
import { backendErrorMessage } from "@/lib/api/backend";
import { toDeliverySearchParams } from "@/lib/deliveries/query";
import type { DeliveryPage, DeliveryQuery, DeliverySummary } from "@/lib/types/deliveries";

const emptyDeliveryPage: DeliveryPage = {
  content: [],
  number: 0,
  size: 50,
  totalPages: 1,
  totalElements: 0
};

const emptyDeliverySummary: DeliverySummary = {
  pending: 0,
  production: 0,
  review: 0,
  approved: 0,
  late: 0
};

export async function fetchDeliveries(query: DeliveryQuery): Promise<DeliveryPage> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = toDeliverySearchParams(query);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/deliveries?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyDeliveryPage, sourceUnavailable: true, loadError: "Backend indisponivel em http://localhost:8080." };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyDeliveryPage;
  }

  if (!response.ok) {
    return { ...emptyDeliveryPage, loadError: await backendErrorMessage(response, "Nao foi possivel carregar entregas") };
  }

  return response.json();
}

export async function fetchDeliverySummary(query: Pick<DeliveryQuery, "clientId" | "owner">): Promise<DeliverySummary> {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const params = new URLSearchParams();
  if (query.clientId) params.set("clientId", query.clientId);
  if (query.owner) params.set("owner", query.owner);
  const cookieStore = await cookies();
  const token = cookieStore.get("crm_access_token")?.value;

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}/api/deliveries/summary?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { ...emptyDeliverySummary, sourceUnavailable: true, loadError: "Backend indisponivel em http://localhost:8080." };
  }

  if (response.status === 401 || response.status === 403) {
    return emptyDeliverySummary;
  }

  if (!response.ok) {
    return { ...emptyDeliverySummary, loadError: await backendErrorMessage(response, "Nao foi possivel carregar resumo de entregas") };
  }

  return response.json();
}
