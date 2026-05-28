import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-[70vh] rounded-2xl border border-line bg-panel/80 p-6 shadow-panel md:p-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
          Acesso restrito
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
          Seu perfil nao tem permissao para esta area
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          A plataforma bloqueou esta rota antes de carregar os dados. Se voce
          precisa operar este modulo, solicite ajuste de permissao para um
          administrador.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/clients"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-400"
          >
            Abrir clientes
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-line bg-white/[0.035] px-4 py-2 text-sm font-bold text-zinc-200 transition hover:bg-white/[0.07]"
          >
            Trocar usuario
          </Link>
        </div>
      </div>
    </main>
  );
}
