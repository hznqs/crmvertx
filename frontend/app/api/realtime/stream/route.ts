import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return new Response("Sessao ausente", { status: 401 });
  }

  const apiBaseUrl = process.env.CRM_API_BASE_URL ?? "http://localhost:8080";
  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${apiBaseUrl}/api/realtime/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream"
      },
      cache: "no-store"
    });
  } catch {
    return new Response("Realtime indisponivel", { status: 503 });
  }

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response("Realtime nao autorizado", { status: backendResponse.status });
  }

  return new Response(backendResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
