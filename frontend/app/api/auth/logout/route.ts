import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionCookies,
  shouldUseSecureCookies
} from "@/lib/auth/session-cookies";
import { rejectCrossOriginRequest } from "@/lib/auth/request-guard";

export async function POST(request: Request) {
  const crossOriginResponse = rejectCrossOriginRequest(request);
  if (crossOriginResponse) {
    return crossOriginResponse;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";

  if (accessToken) {
    await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken, revokeAllSessions: false })
    }).catch(() => null);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response, shouldUseSecureCookies());

  return response;
}
