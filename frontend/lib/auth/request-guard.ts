import { NextResponse } from "next/server";

export function rejectCrossOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host = forwardedHost(request) ?? request.headers.get("host");

  if (!origin || !host) {
    return NextResponse.json({ message: "Origem da requisicao ausente" }, { status: 403 });
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host) {
      return null;
    }
  } catch {
    return NextResponse.json({ message: "Origem da requisicao invalida" }, { status: 403 });
  }

  return NextResponse.json({ message: "Origem da requisicao nao permitida" }, { status: 403 });
}

function forwardedHost(request: Request) {
  const forwardedHostHeader = request.headers.get("x-forwarded-host");
  return forwardedHostHeader?.split(",")[0]?.trim() || null;
}
