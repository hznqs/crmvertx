import { EmptyState, PageHeader, Section } from "@/components/app/enterprise-page";
import { fetchTeamMembers } from "@/lib/api/team";

export default async function UsersPage() {
  const team = await fetchTeamMembers({ search: "", role: "", page: 0, size: 20 });

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Acesso"
        title="Usuarios"
        description="Visao operacional de pessoas, cargos e base para evoluir convites, permissoes granulares e times."
      />

      <Section title="Usuarios e equipe">
        {team.content.length ? (
          <div className="grid gap-3">
            {team.content.map((member) => (
              <article key={member.id} className="rounded-lg border border-line bg-white/[0.025] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">{member.name}</h2>
                    <p className="mt-1 text-xs text-muted">{member.email || "email nao informado"}</p>
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-zinc-300">
                    {member.role}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum usuario operacional encontrado" description="A gestao completa de usuarios fica preparada para convite, cargos e politicas de acesso." />
        )}
      </Section>
    </main>
  );
}
