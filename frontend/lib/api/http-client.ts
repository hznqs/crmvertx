export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      method: options.method ?? "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: await response.text().catch(() => "Falha na requisicao")
      };
    }

    if (response.status === 204) {
      return { ok: true, data: undefined as T };
    }

    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : "Falha de rede"
    };
  }
}
