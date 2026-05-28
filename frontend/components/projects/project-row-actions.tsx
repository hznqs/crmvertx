"use client";

import { useState } from "react";
import { ProjectDialogFooter } from "@/components/projects/project-create-button";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ProjectFormFields } from "@/components/projects/project-form-fields";
import { ProjectSubmitButton } from "@/components/projects/project-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { deleteProjectAction, updateProjectAction, updateProjectStatusAction } from "@/lib/projects/actions";
import { projectStatusLabels } from "@/lib/projects/labels";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Project, ProjectSelectOption } from "@/lib/types/projects";

type ProjectRowActionsProps = {
  project: Project;
  clientOptions: ProjectSelectOption[];
  serviceOptions: ProjectSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function ProjectRowActions({ project, clientOptions, serviceOptions, actionPermissions }: ProjectRowActionsProps) {
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
        <form action={deleteProjectAction}>
          <input type="hidden" name="id" value={project.id} />
          <ProjectSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <ProjectDialog title="Editar projeto" eyebrow={project.name} onClose={() => setIsEditing(false)}>
          <form action={updateProjectAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={project.id} />
            <ProjectFormFields project={project} clientOptions={clientOptions} serviceOptions={serviceOptions} />
            <ProjectDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </ProjectDialog>
      ) : null}

      {isChangingStatus ? (
        <ProjectDialog title="Atualizar status" eyebrow={project.name} onClose={() => setIsChangingStatus(false)}>
          <form action={updateProjectStatusAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={project.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-300">Status</span>
                <PremiumSelect name="status" defaultValue={project.status} options={Object.entries(projectStatusLabels).map(([value, label]) => ({ value, label }))} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-300">Progresso</span>
                <FormattedInput name="progress" mask="percentage" defaultValue={project.progress} />
              </label>
            </div>
            <ProjectDialogFooter onClose={() => setIsChangingStatus(false)} submitLabel="Atualizar status" />
          </form>
        </ProjectDialog>
      ) : null}
    </div>
  );
}
