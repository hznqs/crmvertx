"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-ink text-white antialiased">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-xl rounded-2xl border border-line bg-panel/95 p-6 shadow-panel md:p-8">
            <BrandLogo variant="full" size="md" className="mb-6 border-0 bg-transparent ring-0 shadow-none" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
              Erro critico
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight">
              A aplicacao precisou interromper esta renderizacao
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted">
              Recarregue a interface. Se o problema continuar, use o codigo abaixo para localizar o evento nos logs.
            </p>
            <p className="mt-4 rounded-lg border border-line bg-white/[0.035] px-3 py-2 text-xs text-zinc-400">
              Codigo: {error.digest ?? "nao informado"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="crm-button-primary"
              >
                Recarregar
              </button>
              <Link
                href="/login"
                className="crm-button-secondary"
              >
                Ir para login
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
