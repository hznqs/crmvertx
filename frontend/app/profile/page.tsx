import { PageHeader, Section } from "@/components/app/enterprise-page";
import { getSessionUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await getSessionUser();

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Conta"
        title="Perfil"
        description="Dados da sessao atual, cargo operacional e controles de seguranca pessoal."
      />

      <Section title="Identidade">
        <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Nome" value={user?.name} />
          <Info label="Email" value={user?.email} />
          <Info label="Cargo" value={user?.role} />
          <Info label="Usuario" value={user?.id} />
        </dl>
      </Section>

      <Section title="Seguranca da conta" description="A sessao usa cookies HttpOnly, refresh token rotativo e logout com revogacao no backend.">
        <div className="grid gap-4 md:grid-cols-3">
          <Status title="Cookie HttpOnly" value="Ativo" />
          <Status title="SameSite" value="Strict" />
          <Status title="Rotacao de refresh" value="Ativa" />
        </div>
      </Section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.025] p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</dt>
      <dd className="mt-2 break-words text-sm font-semibold text-white">{value || "-"}</dd>
    </div>
  );
}

function Status({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
      <p className="text-sm font-bold text-emerald-100">{title}</p>
      <p className="mt-2 text-xs text-emerald-200/80">{value}</p>
    </div>
  );
}
