import { EmptyState, PageHeader, Section } from "@/components/app/enterprise-page";

const notificationRules = [
  "Lead quente sem follow-up",
  "Contrato proximo do vencimento",
  "Entrega atrasada",
  "Comissao aguardando pagamento",
  "Upload sensivel realizado"
];

export default function NotificationsPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Notificacoes"
        description="Centro de alertas do CRM para eventos comerciais, financeiros, entregas e seguranca."
      />

      <Section title="Regras ativas">
        <div className="grid gap-3 md:grid-cols-2">
          {notificationRules.map((rule) => (
            <article key={rule} className="rounded-lg border border-line bg-white/[0.025] p-4">
              <p className="text-sm font-bold text-white">{rule}</p>
              <p className="mt-2 text-xs text-muted">Preparado para envio in-app, email e webhooks.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Inbox">
        <EmptyState title="Nenhuma notificacao pendente" description="Quando automacoes e eventos em tempo real forem emitidos, eles entram nesta fila operacional." />
      </Section>
    </main>
  );
}
