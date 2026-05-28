"use client";

import { useState } from "react";
import { deleteTeamMemberAction, updateTeamMemberAction } from "@/lib/team/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { TeamMember } from "@/lib/types/team";
import { TeamDialogFooter } from "@/components/team/team-create-button";
import { TeamDialog } from "@/components/team/team-dialog";
import { TeamFormFields } from "@/components/team/team-form-fields";
import { TeamSubmitButton } from "@/components/team/team-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";

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
      {actionPermissions.canWrite ? (
        <RowActionButton onClick={() => setIsEditing(true)}>
          Editar
        </RowActionButton>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteTeamMemberAction}>
          <input type="hidden" name="id" value={member.id} />
          <TeamSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <TeamDialog title="Editar membro" eyebrow={member.name} onClose={() => setIsEditing(false)}>
          <form action={updateTeamMemberAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={member.id} />
            <TeamFormFields member={member} />
            <TeamDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </TeamDialog>
      ) : null}
    </div>
  );
}
