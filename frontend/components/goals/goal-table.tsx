import { formatDate } from "@/lib/formatters";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { goalTypeLabels, goalTypeTone } from "@/lib/goals/labels";
import type { Goal, GoalPage } from "@/lib/types/goals";
import { GoalRowActions } from "@/components/goals/goal-row-actions";
import { formatGoalValue } from "@/components/goals/goal-value";

type GoalTableProps = {
  goalPage: GoalPage;
  actionPermissions: ModuleActionPermissions;
};

export function GoalTable({ goalPage, actionPermissions }: GoalTableProps) {
  if (goalPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhuma meta encontrada</p>
        <p className="mt-2 text-sm text-muted">Ajuste o periodo ou cadastre uma nova meta.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Meta</th>
              <th className="px-5 py-4 font-bold">Progresso</th>
              <th className="px-5 py-4 font-bold">Alvo</th>
              <th className="px-5 py-4 font-bold">Atual</th>
              <th className="px-5 py-4 font-bold">Periodo</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {goalPage.content.map((goal) => (
              <GoalRow key={goal.id} goal={goal} actionPermissions={actionPermissions} />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {goalPage.number + 1} de {goalPage.totalPages}</span>
        <span>{goalPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function GoalRow({
  goal,
  actionPermissions
}: {
  goal: Goal;
  actionPermissions: ModuleActionPermissions;
}) {
  const progress = Number(goal.progress ?? 0);

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${goalTypeTone[goal.type]}`}>
          {goalTypeLabels[goal.type]}
        </span>
        <p className="mt-2 text-xs text-zinc-500">{formatDate(goal.date)}</p>
      </td>
      <td className="px-5 py-4">
        <div className="min-w-40">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{progress.toFixed(0)}%</span>
            <span>{progress >= 100 ? "concluida" : "em curso"}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-400" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
      </td>
      <td className="px-5 py-4 font-semibold text-white">{formatGoalValue(goal.type, goal.target)}</td>
      <td className="px-5 py-4 text-zinc-300">{formatGoalValue(goal.type, goal.actual)}</td>
      <td className="px-5 py-4 text-zinc-300">
        <div>{formatDate(goal.periodStart)}</div>
        <div className="mt-1 text-xs text-zinc-500">ate {formatDate(goal.periodEnd)}</div>
      </td>
      <td className="px-5 py-4"><GoalRowActions goal={goal} actionPermissions={actionPermissions} /></td>
    </tr>
  );
}
