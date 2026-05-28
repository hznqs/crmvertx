import type { ClientQuery, ClientSearchParams } from "@/lib/types/clients";

export function buildClientQuery(searchParams: ClientSearchParams): ClientQuery {
  return {
    page: toPositiveInteger(searchParams.page, 0),
    size: toPositiveInteger(searchParams.size, 25),
    search: normalize(searchParams.search),
    phase: normalize(searchParams.phase),
    status: normalize(searchParams.status),
    priority: normalize(searchParams.priority)
  };
}

export function toClientSearchParams(query: ClientQuery) {
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
