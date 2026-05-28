import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "crm_access_token";
export const REFRESH_TOKEN_COOKIE = "crm_refresh_token";
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type SessionCookieOptions = {
  httpOnly: true;
  sameSite: "strict";
  secure: boolean;
  path: "/";
  maxAge: number;
};

type SessionCookieSettings = {
  maxAge: number;
  secure: boolean;
};

export function sessionCookieOptions({
  maxAge,
  secure
}: SessionCookieSettings): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge
  };
}

export function shouldUseSecureCookies() {
  return process.env.NODE_ENV === "production";
}

export function clearSessionCookies(response: NextResponse, secure: boolean) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    "",
    sessionCookieOptions({ maxAge: 0, secure })
  );

  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    "",
    sessionCookieOptions({ maxAge: 0, secure })
  );
}
