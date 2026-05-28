import { EmptyState, PageHeader, Section } from "@/components/app/enterprise-page";
import { fetchUploadedDocuments } from "@/lib/api/uploads";
import { formatDate } from "@/lib/formatters";

export default async function DocumentsPage() {
  const documents = await fetchUploadedDocuments();

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Arquivos"
        title="Documentos"
        description="Biblioteca segura de uploads vinculados a clientes, contratos, projetos e operacoes do CRM."
      />

      <Section title="Ultimos documentos" description="Arquivos sao servidos pela API Java com validacao de conteudo, auditoria e permissao por modulo.">
        {documents.content.length ? (
          <div className="grid gap-3">
            {documents.content.map((document) => (
              <article key={document.id} className="rounded-lg border border-line bg-white/[0.025] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">{document.originalFilename}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {document.contentType || "application/octet-stream"} · {Math.round(document.sizeBytes / 1024)} KB · {formatDate(document.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-zinc-300">
                    {document.entityType || "geral"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum documento encontrado" description="Uploads seguros feitos pelo CRM aparecem aqui com tipo, vinculo operacional e data de criacao." />
        )}
      </Section>
    </main>
  );
}
