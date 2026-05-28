"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-[70vh] rounded-2xl border border-line bg-panel/80 p-6 shadow-panel md:p-10">
      <div className="max-w-2xl">
        <BrandLogo variant="full" size="md" className="mb-6 border-0 bg-transparent ring-0 shadow-none" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
          Falha temporaria
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
          Nao foi possivel carregar esta area
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          A tela encontrou um erro inesperado. A sessao continua protegida e voce pode tentar carregar novamente.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-lg border border-line bg-white/[0.035] px-3 py-2 text-xs text-zinc-400">
            Codigo: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="crm-button-primary"
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="crm-button-secondary"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
