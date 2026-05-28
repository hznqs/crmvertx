import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session-cookies";

export type BackendPage<TRecord extends Record<string, unknown>> = {
  content: TRecord[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  sourceUnavailable?: boolean;
  unauthorized?: boolean;
};

const defaultPage = {
  content: [],
  number: 0,
  size: 25,
  totalPages: 1,
  totalElements: 0
};

export async function fetchBackendPage<TRecord extends Record<string, unknown>>(
  endpoint: string,
  params: URLSearchParams
): Promise<BackendPage<TRecord>> {
  const response = await fetchBackend(endpoint, params);

  if (response.status === "unavailable") {
    return { ...defaultPage, sourceUnavailable: true };
  }

  if (response.status === "unauthorized") {
    return { ...defaultPage, unauthorized: true };
  }

  const body = response.body;
  if (Array.isArray(body)) {
    return {
      ...defaultPage,
      content: body as TRecord[],
      totalElements: body.length
    };
  }

  return body as BackendPage<TRecord>;
}

export async function fetchBackendJson<TResponse>(
  endpoint: string,
  params = new URLSearchParams()
): Promise<TResponse | null> {
  const response = await fetchBackend(endpoint, params);
  return response.status === "ok" ? (response.body as TResponse) : null;
}

async function fetchBackend(endpoint: string, params: URLSearchParams) {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const query = params.toString();
  const url = `${apiBaseUrl}${endpoint}${query ? `?${query}` : ""}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
  } catch {
    return { status: "unavailable" as const };
  }

  if (response.status === 401 || response.status === 403) {
    return { status: "unauthorized" as const };
  }

  if (!response.ok) {
    return { status: "unavailable" as const };
  }

  return {
    status: "ok" as const,
    body: await response.json()
  };
}
