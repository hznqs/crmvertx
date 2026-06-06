"use client";

import { Pencil, XCircle } from "lucide-react";
import { useState } from "react";
import { deleteCalendarEventAction, updateCalendarEventAction } from "@/lib/calendar/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { CalendarClientOption, CalendarEvent, CalendarRelationOption } from "@/lib/types/calendar";
import { CalendarDialogFooter } from "@/components/calendar/calendar-create-button";
import { CalendarDialog } from "@/components/calendar/calendar-dialog";
import { CalendarEventFormFields } from "@/components/calendar/calendar-event-form-fields";
import { ActionMenu, type ActionMenuAction } from "@/components/ui/action-menu";
import { ReadOnlyActionLabel } from "@/components/ui/row-actions";
import { SafeActionForm } from "@/components/ui/safe-action-form";

type CalendarEventActionsProps = {
  event: CalendarEvent;
  clientOptions: CalendarClientOption[];
  leadOptions: CalendarRelationOption[];
  contractOptions: CalendarRelationOption[];
  projectOptions: CalendarRelationOption[];
  taskOptions: CalendarRelationOption[];
  actionPermissions: ModuleActionPermissions;
};

export function CalendarEventActions({
  event,
  clientOptions,
  leadOptions,
  contractOptions,
  projectOptions,
  taskOptions,
  actionPermissions
}: CalendarEventActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (event.source && event.source !== "event") {
    return (
      <p className="mt-4 text-xs font-medium text-zinc-500">
        Edite este item no modulo de origem.
      </p>
    );
  }

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel className="mt-4 block" />;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <ActionMenu actions={calendarActions()} />

      {isEditing ? (
        <CalendarDialog title="Editar reuniao" eyebrow={event.title} onClose={() => setIsEditing(false)}>
          <SafeActionForm action={updateCalendarEventAction} onSuccess={() => setIsEditing(false)} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={event.id} />
            <CalendarEventFormFields
              event={event}
              clientOptions={clientOptions}
              leadOptions={leadOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              taskOptions={taskOptions}
            />
            <CalendarDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </SafeActionForm>
        </CalendarDialog>
      ) : null}
    </div>
  );

  function calendarActions(): ActionMenuAction[] {
    return [
      {
        label: "Editar evento",
        icon: Pencil,
        onSelect: () => setIsEditing(true),
        hidden: !actionPermissions.canWrite
      },
      {
        label: "Cancelar evento",
        icon: XCircle,
        variant: "danger",
        separatorBefore: true,
        formAction: deleteCalendarEventAction,
        fields: { id: event.id },
        hidden: !actionPermissions.canManage,
        requiresConfirmation: true,
        confirmationTitle: "Cancelar evento",
        confirmationDescription: "Tem certeza que deseja cancelar este evento? Ele sera marcado como cancelado na agenda.",
        confirmationActionLabel: "Cancelar evento"
      }
    ];
  }
}
