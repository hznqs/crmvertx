import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE
} from "@/lib/auth/session-cookies";
import { normalizeUserRole, type UserRole } from "@/lib/auth/permissions";

export type SessionUser = {
  id: string | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
};

type JwtPayload = {
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return null;
  }

  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const role = normalizeUserRole(payload?.role);

  return {
    id: payload?.sub ?? null,
    name: payload?.name ?? null,
    email: payload?.email ?? null,
    role
  };
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = withBase64Padding(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

function withBase64Padding(value: string) {
  const padding = value.length % 4;
  return padding === 0 ? value : value.padEnd(value.length + 4 - padding, "=");
}
