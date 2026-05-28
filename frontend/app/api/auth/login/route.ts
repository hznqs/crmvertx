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

  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  const credentials = await request.json();
  const requestedRedirectPath = safeInternalPath(credentials?.redirectPath);

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
  } catch {
    return NextResponse.json(
      { message: "Backend indisponivel" },
      { status: 503 }
    );
  }

  if (!backendResponse.ok) {
    return NextResponse.json(
      { message: "Credenciais invalidas ou backend indisponivel" },
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
