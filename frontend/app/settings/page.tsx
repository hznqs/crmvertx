import { MetricCard } from "@/components/app/metric-card";
import { EmptyState, PageHeader, Section } from "@/components/app/enterprise-page";
import { AdminCleanupPanel } from "@/components/settings/admin-cleanup-panel";
import { fetchCrmSettings, fetchOrganization } from "@/lib/api/settings";
import { getSessionUser } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default async function SettingsPage() {
  const [settings, organization, user] = await Promise.all([
    fetchCrmSettings(),
    fetchOrganization(),
    getSessionUser()
  ]);
  const canCleanupData = user?.role === "ADMIN";

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Governanca"
        title="Configuracoes"
        description="Central de parametros comerciais, metas padrao, moeda, timezone e dados institucionais usados pelo CRM."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Meta de receita" value={formatCurrency(settings?.agencyRevenueGoal)} helper="Objetivo comercial da agencia" />
        <MetricCard label="Ticket alvo" value={formatCurrency(settings?.agencyAverageTicketGoal)} helper="Referencia para propostas" />
        <MetricCard label="Retencao alvo" value={`${Number(settings?.agencyRetentionGoal ?? 0).toFixed(1)}%`} helper="Saude esperada da carteira" />
      </section>

      <Section title="Empresa" description="Dados usados em contratos, relacionamento e padronizacao operacional.">
        {organization || settings ? (
          <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Info label="Nome" value={organization?.name ?? settings?.companyName} />
            <Info label="Email" value={organization?.email ?? settings?.companyEmail} />
            <Info label="Telefone" value={organization?.phone ?? settings?.companyPhone} />
            <Info label="Documento" value={organization?.document ?? settings?.companyDocument} />
            <Info label="Website" value={organization?.website ?? settings?.companyWebsite} />
            <Info label="Atualizado em" value={formatDate(organization?.updatedAt ?? settings?.updatedAt)} />
          </dl>
        ) : (
          <EmptyState title="Configuracoes indisponiveis" description="A API de configuracoes nao respondeu ou seu perfil nao possui permissao para leitura." />
        )}
      </Section>

      <Section title="Parametros operacionais">
        <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Moeda" value={settings?.defaultCurrency} />
          <Info label="Timezone" value={settings?.defaultTimezone} />
          <Info label="Imposto padrao" value={`${Number(settings?.defaultTaxRate ?? 0).toFixed(1)}%`} />
          <Info label="Comissao padrao" value={`${Number(settings?.defaultCommissionRate ?? 0).toFixed(1)}%`} />
        </dl>
      </Section>

      {canCleanupData ? <AdminCleanupPanel /> : null}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.025] p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-white">{value || "-"}</dd>
    </div>
  );
}
