import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { taskPriorityLabels, taskPriorityTone, taskStatusLabels, taskStatusTone } from "@/lib/tasks/labels";
import type { Task } from "@/lib/types/tasks";

type OperationalTasksProps = {
  tasks: Task[];
};

export function OperationalTasks({ tasks }: OperationalTasksProps) {
  return (
    <section className="rounded-xl bg-panel/95 p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white">Tarefas criticas</h2>
        <Link href="/tasks" className="text-sm font-bold text-brand-400 hover:text-brand-300">Abrir</Link>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.length ? tasks.map((task) => (
          <article key={task.id} className="rounded-xl border border-line bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{task.title}</p>
                <p className="mt-1 text-xs text-zinc-500">Prazo {formatDate(task.dueDate)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${taskStatusTone[task.status]}`}>
                {taskStatusLabels[task.status]}
              </span>
            </div>
            <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${taskPriorityTone[task.priority]}`}>
              {taskPriorityLabels[task.priority]}
            </span>
          </article>
        )) : <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">Nenhuma tarefa atrasada no momento.</div>}
      </div>
    </section>
  );
}
