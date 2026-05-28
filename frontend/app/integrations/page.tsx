import { PageHeader, Section } from "@/components/app/enterprise-page";

const integrations = [
  { name: "WhatsApp Business", status: "Planejado", helper: "Entrada de leads, mensagens e follow-ups" },
  { name: "Email transacional", status: "Planejado", helper: "Envio de propostas, alertas e notificacoes" },
  { name: "Supabase Storage", status: "Disponivel", helper: "Uploads passam pela API Java" },
  { name: "Webhooks", status: "Roadmap", helper: "Automacoes externas e eventos do CRM" }
];

export default function IntegrationsPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Ecossistema"
        title="Integracoes"
        description="Hub de conectores atuais e futuros para transformar o CRM em plataforma operacional extensivel."
      />

      <Section title="Conectores">
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <article key={integration.name} className="rounded-lg border border-line bg-white/[0.025] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">{integration.name}</h2>
                  <p className="mt-2 text-xs leading-5 text-muted">{integration.helper}</p>
                </div>
                <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-semibold text-zinc-300">
                  {integration.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
