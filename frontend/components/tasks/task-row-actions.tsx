"use client";

import { useState } from "react";
import { TaskDialogFooter } from "@/components/tasks/task-create-button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskFormFields } from "@/components/tasks/task-form-fields";
import { TaskSubmitButton } from "@/components/tasks/task-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { deleteTaskAction, updateTaskAction, updateTaskStatusAction } from "@/lib/tasks/actions";
import { taskStatusLabels } from "@/lib/tasks/labels";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Task, TaskProjectOption } from "@/lib/types/tasks";

type TaskRowActionsProps = {
  task: Task;
  projectOptions: TaskProjectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function TaskRowActions({ task, projectOptions, actionPermissions }: TaskRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actionPermissions.canWrite ? (
        <>
          <RowActionButton onClick={() => setIsEditing(true)}>
            Editar
          </RowActionButton>
          <RowActionButton tone="brand" onClick={() => setIsChangingStatus(true)}>
            Status
          </RowActionButton>
        </>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <TaskSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <TaskDialog title="Editar tarefa" eyebrow={task.title} onClose={() => setIsEditing(false)}>
          <form action={updateTaskAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={task.id} />
            <TaskFormFields task={task} projectOptions={projectOptions} />
            <TaskDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </TaskDialog>
      ) : null}

      {isChangingStatus ? (
        <TaskDialog title="Atualizar status" eyebrow={task.title} onClose={() => setIsChangingStatus(false)}>
          <form action={updateTaskStatusAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={task.id} />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-300">Status</span>
              <PremiumSelect name="status" defaultValue={task.status} options={Object.entries(taskStatusLabels).map(([value, label]) => ({ value, label }))} />
            </label>
            <TaskDialogFooter onClose={() => setIsChangingStatus(false)} submitLabel="Atualizar status" />
          </form>
        </TaskDialog>
      ) : null}
    </div>
  );
}
