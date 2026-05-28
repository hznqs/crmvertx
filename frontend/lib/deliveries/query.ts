import type { DeliveryQuery, DeliverySearchParams } from "@/lib/types/deliveries";

export function buildDeliveryQuery(searchParams: DeliverySearchParams): DeliveryQuery {
  return {
    status: searchParams.status ?? "",
    owner: searchParams.owner ?? "",
    clientId: searchParams.clientId ?? "",
    page: Math.max(Number(searchParams.page ?? 0), 0),
    size: Math.min(Math.max(Number(searchParams.size ?? 50), 1), 100)
  };
}

export function toDeliverySearchParams(query: DeliveryQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });
  return params;
}
