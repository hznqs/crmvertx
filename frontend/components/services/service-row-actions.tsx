"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { DialogFooter } from "@/components/services/service-create-button";
import { ServiceDialog } from "@/components/services/service-dialog";
import { ServiceFormFields } from "@/components/services/service-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { deleteServiceAction, updateServiceAction } from "@/lib/services/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { ServiceOffering } from "@/lib/types/services";

type ServiceRowActionsProps = {
  service: ServiceOffering;
  actionPermissions: ModuleActionPermissions;
};

export function ServiceRowActions({ service, actionPermissions }: ServiceRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={serviceActions()} />

      {isEditing ? (
        <ServiceDialog title="Editar servico" eyebrow={service.name} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateServiceAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={service.id} />
            <ServiceFormFields service={service} />
            <DialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </ServiceDialog>
      ) : null}
    </div>
  );

  function serviceActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar servico",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteServiceAction,
        fields: { id: service.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar servico",
        confirmationDescription: "Tem certeza que deseja arquivar este servico? Contratos e projetos podem depender deste cadastro.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
