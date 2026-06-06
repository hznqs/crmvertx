"use client";

import { CheckCircle, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { TaskDialogFooter } from "@/components/tasks/task-create-button";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskFormFields } from "@/components/tasks/task-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { SafeActionForm } from "@/components/ui/safe-action-form";
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
      <ActionMenu actions={taskActions()} />

      {isEditing ? (
        <TaskDialog title="Editar tarefa" eyebrow={task.title} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateTaskAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={task.id} />
            <TaskFormFields task={task} projectOptions={projectOptions} />
            <TaskDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </TaskDialog>
      ) : null}

      {isChangingStatus ? (
        <TaskDialog title="Atualizar status" eyebrow={task.title} onClose={() => setIsChangingStatus(false)}>
          <SafeActionForm action={updateTaskStatusAction} onSuccess={() => setIsChangingStatus(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={task.id} />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-300">Status</span>
              <PremiumSelect name="status" defaultValue={task.status} options={Object.entries(taskStatusLabels).map(([value, label]) => ({ value, label }))} />
            </label>
            <TaskDialogFooter onClose={() => setIsChangingStatus(false)} submitLabel="Atualizar status" />
          </SafeActionForm>
        </TaskDialog>
      ) : null}
    </div>
  );

  function taskActions(): ActionMenuAction[] {
    const completed = task.status === "CONCLUIDA";

    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: completed ? "Reabrir tarefa" : "Atualizar status",
        icon: completed ? RotateCcw : CheckCircle,
        variant: "secondary",
        onSelect: () => setIsChangingStatus(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar tarefa",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteTaskAction,
        fields: { id: task.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar tarefa",
        confirmationDescription: "Tem certeza que deseja arquivar esta tarefa? Isso pode impactar progresso de projeto e indicadores operacionais.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
