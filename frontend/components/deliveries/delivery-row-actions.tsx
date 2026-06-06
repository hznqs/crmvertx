"use client";

import { CheckCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeliveryDialogFooter } from "@/components/deliveries/delivery-create-button";
import { DeliveryDialog } from "@/components/deliveries/delivery-dialog";
import { DeliveryFormFields } from "@/components/deliveries/delivery-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { SafeActionForm } from "@/components/ui/safe-action-form";
import { deleteDeliveryAction, updateDeliveryAction, updateDeliveryStatusAction } from "@/lib/deliveries/actions";
import { deliveryStatusLabels } from "@/lib/deliveries/labels";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Delivery, DeliverySelectOption } from "@/lib/types/deliveries";

type DeliveryRowActionsProps = {
  delivery: Delivery;
  clientOptions: DeliverySelectOption[];
  projectOptions: DeliverySelectOption[];
  contractOptions: DeliverySelectOption[];
  serviceOptions: DeliverySelectOption[];
  actionPermissions: ModuleActionPermissions;
};

export function DeliveryRowActions({
  delivery,
  clientOptions,
  projectOptions,
  contractOptions,
  serviceOptions,
  actionPermissions
}: DeliveryRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ActionMenu actions={deliveryActions()} />

      {isEditing ? (
        <DeliveryDialog title="Editar entrega" eyebrow={delivery.title} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateDeliveryAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={delivery.id} />
            <DeliveryFormFields
              delivery={delivery}
              clientOptions={clientOptions}
              projectOptions={projectOptions}
              contractOptions={contractOptions}
              serviceOptions={serviceOptions}
            />
            <DeliveryDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </DeliveryDialog>
      ) : null}

      {isChangingStatus ? (
        <DeliveryDialog title="Atualizar status" eyebrow={delivery.title} onClose={() => setIsChangingStatus(false)}>
          <SafeActionForm action={updateDeliveryStatusAction} onSuccess={() => setIsChangingStatus(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={delivery.id} />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-300">Status</span>
              <PremiumSelect name="status" defaultValue={delivery.status} options={Object.entries(deliveryStatusLabels).map(([value, label]) => ({ value, label }))} />
            </label>
            <DeliveryDialogFooter onClose={() => setIsChangingStatus(false)} submitLabel="Atualizar status" />
          </SafeActionForm>
        </DeliveryDialog>
      ) : null}
    </div>
  );

  function deliveryActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Atualizar status",
        icon: CheckCircle,
        variant: "secondary",
        onSelect: () => setIsChangingStatus(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Arquivar entrega",
        icon: Trash2,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteDeliveryAction,
        fields: { id: delivery.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Arquivar entrega",
        confirmationDescription: "Tem certeza que deseja arquivar esta entrega? Ela deixara de aparecer nas listagens operacionais.",
        confirmationActionLabel: "Arquivar"
      }
    ];
  }
}
