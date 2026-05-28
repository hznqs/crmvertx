import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function NotFoundPage() {
  return (
    <main className="min-h-[70vh] rounded-2xl border border-line bg-panel/80 p-6 shadow-panel md:p-10">
      <div className="max-w-2xl">
        <BrandLogo variant="full" size="md" className="mb-6 border-0 bg-transparent ring-0 shadow-none" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Pagina nao encontrada
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
          Essa area nao existe ou foi movida
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Volte para uma area principal da plataforma para continuar operando.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="crm-button-primary"
          >
            Abrir dashboard
          </Link>
          <Link
            href="/clients"
            className="crm-button-secondary"
          >
            Ver clientes
          </Link>
        </div>
      </div>
    </main>
  );
}
