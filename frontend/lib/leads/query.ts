import type { LeadQuery, LeadSearchParams } from "@/lib/types/leads";

const defaultPageSize = 25;

export function buildLeadQuery(searchParams: LeadSearchParams): LeadQuery {
  return {
    page: toPositiveInteger(searchParams.page, 0),
    size: toPositiveInteger(searchParams.size, defaultPageSize),
    search: normalize(searchParams.search),
    commercialStage: normalize(searchParams.commercialStage),
    temperature: normalize(searchParams.temperature),
    origin: normalize(searchParams.origin),
    status: normalize(searchParams.status)
  };
}

export function toLeadSearchParams(query: LeadQuery) {
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
