"use client";

import { useState } from "react";
import { DeliveryDialogFooter } from "@/components/deliveries/delivery-create-button";
import { DeliveryDialog } from "@/components/deliveries/delivery-dialog";
import { DeliveryFormFields } from "@/components/deliveries/delivery-form-fields";
import { DeliverySubmitButton } from "@/components/deliveries/delivery-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
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
        <form action={deleteDeliveryAction}>
          <input type="hidden" name="id" value={delivery.id} />
          <DeliverySubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <DeliveryDialog title="Editar entrega" eyebrow={delivery.title} onClose={() => setIsEditing(false)}>
          <form action={updateDeliveryAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={delivery.id} />
            <DeliveryFormFields
              delivery={delivery}
              clientOptions={clientOptions}
              projectOptions={projectOptions}
              contractOptions={contractOptions}
              serviceOptions={serviceOptions}
            />
            <DeliveryDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </DeliveryDialog>
      ) : null}

      {isChangingStatus ? (
        <DeliveryDialog title="Atualizar status" eyebrow={delivery.title} onClose={() => setIsChangingStatus(false)}>
          <form action={updateDeliveryStatusAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={delivery.id} />
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-300">Status</span>
              <PremiumSelect name="status" defaultValue={delivery.status} options={Object.entries(deliveryStatusLabels).map(([value, label]) => ({ value, label }))} />
            </label>
            <DeliveryDialogFooter onClose={() => setIsChangingStatus(false)} submitLabel="Atualizar status" />
          </form>
        </DeliveryDialog>
      ) : null}
    </div>
  );
}
