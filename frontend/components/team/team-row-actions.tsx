"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteTeamMemberAction, updateTeamMemberAction } from "@/lib/team/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { TeamMember } from "@/lib/types/team";
import { TeamDialogFooter } from "@/components/team/team-create-button";
import { TeamDialog } from "@/components/team/team-dialog";
import { TeamFormFields } from "@/components/team/team-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";

type TeamRowActionsProps = {
  member: TeamMember;
  actionPermissions: ModuleActionPermissions;
};

export function TeamRowActions({ member, actionPermissions }: TeamRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={teamActions()} />

      {isEditing ? (
        <TeamDialog title="Editar membro" eyebrow={member.name} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateTeamMemberAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={member.id} />
            <TeamFormFields member={member} />
            <TeamDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </TeamDialog>
      ) : null}
    </div>
  );

  function teamActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar membro",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteTeamMemberAction,
        fields: { id: member.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar membro",
        confirmationDescription: "Tem certeza que deseja arquivar este membro? Tarefas, metas e historico podem continuar vinculados.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
