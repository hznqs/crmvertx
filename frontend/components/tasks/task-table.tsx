import { TaskRowActions } from "@/components/tasks/task-row-actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/formatters";
import { taskPriorityLabels, taskPriorityTone, taskStatusLabels, taskStatusTone } from "@/lib/tasks/labels";
import type { Task, TaskPage, TaskProjectOption } from "@/lib/types/tasks";

type TaskTableProps = {
  taskPage: TaskPage;
  projectOptions: TaskProjectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function TaskTable({ taskPage, projectOptions, actionPermissions }: TaskTableProps) {
  if (taskPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white/[0.025] px-6 py-12 text-center">
        <p className="text-base font-semibold text-white">Nenhuma tarefa encontrada</p>
        <p className="mt-2 text-sm text-muted">Ajuste os filtros ou cadastre uma nova tarefa operacional.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-white/[0.025] text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-bold">Tarefa</th>
              <th className="px-5 py-4 font-bold">Prioridade</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Prazo</th>
              <th className="px-5 py-4 font-bold">Projeto</th>
              <th className="px-5 py-4 font-bold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-panel/70">
            {taskPage.content.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                projectOptions={projectOptions}
                actionPermissions={actionPermissions}
              />
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-2 bg-white/[0.025] px-5 py-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <span>Pagina {taskPage.number + 1} de {taskPage.totalPages}</span>
        <span>{taskPage.totalElements} registros encontrados</span>
      </footer>
    </div>
  );
}

function TaskRow({
  task,
  projectOptions,
  actionPermissions
}: {
  task: Task;
  projectOptions: TaskProjectOption[];
  actionPermissions: ModuleActionPermissions;
}) {
  const projectLabel = projectOptions.find((project) => project.id === task.projectId)?.label ?? shortId(task.projectId);

  return (
    <tr className="transition hover:bg-white/[0.035]">
      <td className="px-5 py-4">
        <div className="min-w-72">
          <p className="font-semibold text-white">{task.title}</p>
          <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{task.description || "Sem descricao"}</p>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${taskPriorityTone[task.priority]}`}>
          {taskPriorityLabels[task.priority]}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${taskStatusTone[task.status]}`}>
          {taskStatusLabels[task.status]}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="text-zinc-300">{formatDate(task.dueDate)}</div>
        {task.overdue ? <div className="mt-1 text-xs font-bold text-rose-200">Atrasada</div> : null}
      </td>
      <td className="px-5 py-4 text-zinc-300">{projectLabel}</td>
      <td className="px-5 py-4">
        <TaskRowActions task={task} projectOptions={projectOptions} actionPermissions={actionPermissions} />
      </td>
    </tr>
  );
}

function shortId(value: string) {
  return value.slice(0, 8);
}
