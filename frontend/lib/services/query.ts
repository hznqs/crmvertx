import type { ServiceQuery, ServiceSearchParams } from "@/lib/types/services";

export function buildServiceQuery(searchParams: ServiceSearchParams): ServiceQuery {
  return {
    page: toPositiveInteger(searchParams.page, 0),
    size: toPositiveInteger(searchParams.size, 25),
    search: normalize(searchParams.search),
    category: normalize(searchParams.category),
    billingType: normalize(searchParams.billingType),
    active: normalize(searchParams.active)
  };
}

export function toServiceSearchParams(query: ServiceQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  return params;
}

function normalize(value: string | undefined) {
  return String(value ?? "").trim();
}

function toPositiveInteger(value: string | undefined, fallback: number) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
}
