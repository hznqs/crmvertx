import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { safeInternalPath } from "@/lib/auth/routes";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectPath = safeRedirectPath(firstParam(params?.next));

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-brand-400/10 bg-panel/95 p-6 shadow-glow">
        <div>
          <BrandLogo variant="full" size="lg" priority className="mb-5 border-0 bg-transparent ring-0 shadow-none" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-400">
            VX Midia CRM
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Entrar na plataforma
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Acesso seguro via cookie HTTP-only. Nenhum token sensivel e salvo no
            navegador por JavaScript.
          </p>
        </div>

        <LoginForm redirectPath={redirectPath} />
      </section>
    </main>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeRedirectPath(path: string | undefined) {
  return safeInternalPath(path);
}
