"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCommissionAction, updateCommissionAction } from "@/lib/commissions/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { CommissionSale, CommissionSelectOption } from "@/lib/types/commissions";
import { CommissionDialogFooter } from "@/components/commissions/commission-create-button";
import { CommissionDialog } from "@/components/commissions/commission-dialog";
import { CommissionFormFields } from "@/components/commissions/commission-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";

type CommissionRowActionsProps = {
  commission: CommissionSale;
  memberOptions: CommissionSelectOption[];
  contractOptions: CommissionSelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function CommissionRowActions({ commission, memberOptions, contractOptions, actionPermissions }: CommissionRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={commissionActions()} />

      {isEditing ? (
        <CommissionDialog title="Editar comissao" eyebrow={commission.client ?? "Comissao"} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateCommissionAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={commission.id} />
            <CommissionFormFields commission={commission} memberOptions={memberOptions} contractOptions={contractOptions} />
            <CommissionDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </CommissionDialog>
      ) : null}
    </div>
  );

  function commissionActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar comissao",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteCommissionAction,
        fields: { id: commission.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar comissao",
        confirmationDescription: "Tem certeza que deseja arquivar esta comissao? Isso pode afetar relatorios de pagamento e ranking.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
