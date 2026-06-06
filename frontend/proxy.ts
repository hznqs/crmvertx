import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  clearSessionCookies,
  sessionCookieOptions
} from "@/lib/auth/session-cookies";
import {
  canReadPath,
  normalizedRoleFromValue
} from "@/lib/auth/routes";

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

const refreshSkewSeconds = 120;

export async function proxy(request: NextRequest) {
  if (isStaticOrApiPath(request)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (isLoginPath(request)) {
    return refreshToken ? NextResponse.redirect(new URL("/dashboard", request.url)) : NextResponse.next();
  }

  if (!refreshToken) {
    return redirectToLogin(request);
  }

  if (isForbiddenPath(request)) {
    return NextResponse.next();
  }

  if (!shouldRefresh(accessToken)) {
    return canReadRequestedPath(request, accessToken)
      ? NextResponse.next()
      : redirectToForbidden(request);
  }

  const refreshedSession = await refreshSession(refreshToken);
  const response = canReadRequestedPath(request, refreshedSession?.accessToken)
    ? NextResponse.next()
    : redirectToForbidden(request);
  const secure = isSecureRequest(request);

  if (!refreshedSession) {
    return redirectToLogin(request);
  }

  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    refreshedSession.accessToken,
    sessionCookieOptions({ maxAge: refreshedSession.expiresIn, secure })
  );

  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshedSession.refreshToken,
    sessionCookieOptions({
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
      secure
    })
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/login|api/auth/logout).*)"]
};

function isStaticOrApiPath(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  return pathname.startsWith("/api/") || pathname.includes(".");
}

function isLoginPath(request: NextRequest) {
  return request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";
}

function isForbiddenPath(request: NextRequest) {
  return request.nextUrl.pathname === "/forbidden";
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(loginUrl(request));
  clearSessionCookies(response, isSecureRequest(request));
  return response;
}

function redirectToForbidden(request: NextRequest) {
  const url = new URL("/forbidden", request.url);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.searchParams.set("from", currentPath);
  return NextResponse.redirect(url);
}

function loginUrl(request: NextRequest) {
  const url = new URL("/login", request.url);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.searchParams.set("next", currentPath);
  return url;
}

function shouldRefresh(accessToken: string | undefined) {
  if (!accessToken) {
    return true;
  }

  const expiresAt = jwtExpiration(accessToken);
  if (!expiresAt) {
    return true;
  }

  return expiresAt - currentUnixSeconds() <= refreshSkewSeconds;
}

async function refreshSession(refreshToken: string) {
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RefreshResponse;
  } catch {
    return null;
  }
}

function jwtExpiration(token: string) {
  return jwtPayload(token)?.exp ?? null;
}

function jwtRole(token: string | undefined) {
  return token ? normalizedRoleFromValue(jwtPayload(token)?.role) : null;
}

function jwtPayload(token: string) {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = withBase64Padding(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(atob(normalizedPayload)) as { exp?: number; role?: string };
  } catch {
    return null;
  }
}

function canReadRequestedPath(request: NextRequest, accessToken: string | undefined) {
  return canReadPath(jwtRole(accessToken), request.nextUrl.pathname);
}

function withBase64Padding(value: string) {
  const padding = value.length % 4;
  return padding === 0 ? value : value.padEnd(value.length + 4 - padding, "=");
}

function currentUnixSeconds() {
  return Math.floor(Date.now() / 1000);
}

function isSecureRequest(request: NextRequest) {
  return process.env.NODE_ENV === "production" || request.nextUrl.protocol === "https:";
}
