"use client";

import { useState } from "react";
import {
  convertLeadAction,
  deleteLeadAction,
  updateLeadAction,
  updateLeadStageAction
} from "@/lib/leads/actions";
import { LeadFormFields } from "@/components/leads/lead-form-fields";
import { LeadSubmitButton } from "@/components/leads/lead-submit-button";
import { ModalDialog, ModalFooter } from "@/components/ui/modal-dialog";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { commercialStageLabels } from "@/lib/leads/labels";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { Lead } from "@/lib/types/leads";

type LeadRowActionsProps = {
  lead: Lead;
  actionPermissions: ModuleActionPermissions;
};

export function LeadRowActions({ lead, actionPermissions }: LeadRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

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
          <RowActionButton tone="brand" onClick={() => setIsMoving(true)}>
            Fase
          </RowActionButton>
          <form action={convertLeadAction}>
            <input type="hidden" name="id" value={lead.id} />
            <LeadSubmitButton idleLabel="Converter" pendingLabel="Convertendo..." tone="ghost" />
          </form>
        </>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteLeadAction}>
          <input type="hidden" name="id" value={lead.id} />
          <LeadSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <LeadEditDialog lead={lead} onClose={() => setIsEditing(false)} />
      ) : null}

      {isMoving ? (
        <LeadStageDialog lead={lead} onClose={() => setIsMoving(false)} />
      ) : null}
    </div>
  );
}

function LeadEditDialog({
  lead,
  onClose
}: Readonly<{
  lead: Lead;
  onClose: () => void;
}>) {
  return (
    <ModalDialog title="Editar lead" eyebrow={lead.name} onClose={onClose} maxWidthClassName="max-w-3xl">
        <form action={updateLeadAction} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={lead.id} />
          <LeadFormFields lead={lead} mode="edit" />
          <DialogFooter onClose={onClose} submitLabel="Salvar alteracoes" />
        </form>
    </ModalDialog>
  );
}

function LeadStageDialog({
  lead,
  onClose
}: Readonly<{
  lead: Lead;
  onClose: () => void;
}>) {
  return (
    <ModalDialog title="Atualizar fase" eyebrow={lead.name} onClose={onClose} maxWidthClassName="max-w-lg">
        <form action={updateLeadStageAction} className="mt-5 space-y-5">
          <input type="hidden" name="id" value={lead.id} />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-300">Fase comercial</span>
            <PremiumSelect name="commercialStage" defaultValue={lead.commercialStage} options={Object.entries(commercialStageLabels).map(([value, label]) => ({ value, label }))} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-zinc-300">Motivo de perda</span>
            <input
              name="lostReason"
              defaultValue={lead.lostReason ?? ""}
              className="min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
              placeholder="Obrigatorio se a fase for perdido"
            />
          </label>
          <DialogFooter onClose={onClose} submitLabel="Atualizar fase" />
        </form>
    </ModalDialog>
  );
}

function DialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <LeadSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
