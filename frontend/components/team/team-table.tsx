import { formatCurrency } from "@/lib/formatters";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatTeamRole } from "@/lib/team/labels";
import type { TeamMember, TeamPage } from "@/lib/types/team";
import { TeamRowActions } from "@/components/team/team-row-actions";

type TeamTableProps = {
  teamPage: TeamPage;
  actionPermissions: ModuleActionPermissions;
};

export function TeamTable({ teamPage, actionPermissions }: TeamTableProps) {
  if (teamPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhum membro encontrado</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre uma pessoa da equipe.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Membro</th>
              <th className="px-5 py-4 font-bold">Cargo</th>
              <th className="px-5 py-4 font-bold">Tarefas</th>
              <th className="px-5 py-4 font-bold">Performance</th>
              <th className="px-5 py-4 font-bold">Capacidade</th>
              <th className="px-5 py-4 font-bold">Custo</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {teamPage.content.map((member) => (
              <TeamRow key={member.id} member={member} actionPermissions={actionPermissions} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {teamPage.number + 1} de {teamPage.totalPages}</span>
        <span>{teamPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function TeamRow({
  member,
  actionPermissions
}: {
  member: TeamMember;
  actionPermissions: ModuleActionPermissions;
}) {
  const completion = member.tasks > 0 ? Math.round((member.completed / member.tasks) * 100) : 0;

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-64">
          <p className="font-semibold text-white">{member.name}</p>
          <p className="mt-1 text-xs text-zinc-500">{member.email || member.phone || "Sem contato"}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex rounded-full bg-brand-500/15 px-3 py-1 text-xs font-bold text-fuchsia-100 ring-1 ring-brand-500/20">
          {formatTeamRole(member.role)}
        </span>
      </td>
      <td className="px-5 py-4 text-zinc-300">
        <div>{member.completed}/{member.tasks}</div>
        <div className="mt-2 h-2 min-w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400" style={{ width: `${Math.min(completion, 100)}%` }} />
        </div>
      </td>
      <td className="px-5 py-4 font-semibold text-white">{member.performance}%</td>
      <td className="px-5 py-4 text-zinc-300">{member.capacityHoursMonth}h/mes</td>
      <td className="px-5 py-4 text-zinc-300">{formatCurrency(member.hourlyCost)}/h</td>
      <td className="px-5 py-4"><TeamRowActions member={member} actionPermissions={actionPermissions} /></td>
    </tr>
  );
}
