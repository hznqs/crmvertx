import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  sessionCookieOptions,
  shouldUseSecureCookies
} from "@/lib/auth/session-cookies";
import {
  normalizedRoleFromValue,
  readableRedirectPath,
  safeInternalPath
} from "@/lib/auth/routes";
import { rejectCrossOriginRequest } from "@/lib/auth/request-guard";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export async function POST(request: Request) {
  const crossOriginResponse = rejectCrossOriginRequest(request);
  if (crossOriginResponse) {
    return crossOriginResponse;
  }

  const apiBaseUrl = normalizedApiBaseUrl();
  const credentials = await request.json();
  const requestedRedirectPath = safeInternalPath(credentials?.redirectPath);
  const backendLoginUrl = backendAuthUrl(request, apiBaseUrl);

  if (backendLoginUrl.status === "error") {
    return NextResponse.json(
      { message: backendLoginUrl.message },
      { status: 503 }
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(backendLoginUrl.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials?.email,
        password: credentials?.password
      }),
      signal: AbortSignal.timeout(10000)
    });
  } catch (error) {
    console.error("[auth/login] Backend indisponivel para login.", {
      apiBaseUrl,
      error: error instanceof Error ? error.message : "unknown"
    });
    return NextResponse.json(
      { message: "Backend indisponivel. Verifique se o Spring Boot esta online e se CRM_API_BASE_URL aponta para a API correta." },
      { status: 503 }
    );
  }

  if (!backendResponse.ok) {
    const backendMessage = await readBackendMessage(backendResponse);
    const message = backendResponse.status === 401 || backendResponse.status === 403
      ? "Email ou senha invalidos."
      : backendMessage ?? "Nao foi possivel autenticar no backend.";

    return NextResponse.json(
      { message },
      { status: backendResponse.status }
    );
  }

  const session = (await backendResponse.json()) as LoginResponse;
  const role = normalizedRoleFromValue(session.user.role);
  const response = NextResponse.json({
    user: session.user,
    redirectPath: readableRedirectPath(role, requestedRedirectPath)
  });
  const secure = shouldUseSecureCookies();

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    session.accessToken,
    sessionCookieOptions({ maxAge: session.expiresIn, secure })
  );

  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    session.refreshToken,
    sessionCookieOptions({
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      secure
    })
  );

  return response;
}

function normalizedApiBaseUrl() {
  const configured = process.env.CRM_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return process.env.NODE_ENV === "production" ? "" : "http://localhost:8080";
}

function backendAuthUrl(request: Request, apiBaseUrl: string) {
  if (!apiBaseUrl) {
    return {
      status: "error" as const,
      message: "CRM_API_BASE_URL nao esta configurada no frontend. Configure esta variavel com a URL publica ou interna do backend Spring Boot."
    };
  }

  let apiOrigin: string;
  try {
    apiOrigin = new URL(apiBaseUrl).origin;
  } catch {
    return {
      status: "error" as const,
      message: "CRM_API_BASE_URL invalida. Use uma URL absoluta, por exemplo https://sua-api.up.railway.app."
    };
  }

  const requestOrigin = new URL(request.url).origin;
  if (apiOrigin === requestOrigin) {
    return {
      status: "error" as const,
      message: "CRM_API_BASE_URL aponta para o proprio frontend. Configure esta variavel com a URL do backend Spring Boot, nao com a URL da tela do CRM."
    };
  }

  return {
    status: "ok" as const,
    url: `${apiBaseUrl}/api/auth/login`
  };
}

async function readBackendMessage(response: Response) {
  const error = await response.json().catch(() => null) as { message?: unknown } | null;
  return typeof error?.message === "string" && error.message.trim()
    ? error.message
    : null;
}
