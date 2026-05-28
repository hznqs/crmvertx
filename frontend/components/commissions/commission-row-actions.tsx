"use client";

import { useState } from "react";
import { deleteCommissionAction, updateCommissionAction } from "@/lib/commissions/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { CommissionSale, CommissionSelectOption } from "@/lib/types/commissions";
import { CommissionDialogFooter } from "@/components/commissions/commission-create-button";
import { CommissionDialog } from "@/components/commissions/commission-dialog";
import { CommissionFormFields } from "@/components/commissions/commission-form-fields";
import { CommissionSubmitButton } from "@/components/commissions/commission-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";

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
      {actionPermissions.canWrite ? (
        <RowActionButton onClick={() => setIsEditing(true)}>
          Editar
        </RowActionButton>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteCommissionAction}>
          <input type="hidden" name="id" value={commission.id} />
          <CommissionSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <CommissionDialog title="Editar comissao" eyebrow={commission.client ?? "Comissao"} onClose={() => setIsEditing(false)}>
          <form action={updateCommissionAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={commission.id} />
            <CommissionFormFields commission={commission} memberOptions={memberOptions} contractOptions={contractOptions} />
            <CommissionDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </CommissionDialog>
      ) : null}
    </div>
  );
}
