"use client";

import { useState } from "react";
import { deleteCalendarEventAction, updateCalendarEventAction } from "@/lib/calendar/actions";
import type { ModuleActionPermissions } from "@/lib/auth/permissions";
import type { CalendarClientOption, CalendarEvent } from "@/lib/types/calendar";
import { CalendarDialogFooter } from "@/components/calendar/calendar-create-button";
import { CalendarDialog } from "@/components/calendar/calendar-dialog";
import { CalendarEventFormFields } from "@/components/calendar/calendar-event-form-fields";
import { CalendarSubmitButton } from "@/components/calendar/calendar-submit-button";
import { ReadOnlyActionLabel, RowActionButton } from "@/components/ui/row-actions";

type CalendarEventActionsProps = {
  event: CalendarEvent;
  clientOptions: CalendarClientOption[];
  actionPermissions: ModuleActionPermissions;
};

export function CalendarEventActions({
  event,
  clientOptions,
  actionPermissions
}: CalendarEventActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!actionPermissions.canWrite && !actionPermissions.canManage) {
    return <ReadOnlyActionLabel className="mt-4 block" />;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {actionPermissions.canWrite ? (
        <RowActionButton onClick={() => setIsEditing(true)}>
          Editar
        </RowActionButton>
      ) : null}
      {actionPermissions.canManage ? (
        <form action={deleteCalendarEventAction}>
          <input type="hidden" name="id" value={event.id} />
          <CalendarSubmitButton idleLabel="Excluir" pendingLabel="Excluindo..." tone="danger" />
        </form>
      ) : null}

      {isEditing ? (
        <CalendarDialog title="Editar evento" eyebrow={event.title} onClose={() => setIsEditing(false)}>
          <form action={updateCalendarEventAction} className="mt-5 space-y-5">
            <input type="hidden" name="id" value={event.id} />
            <CalendarEventFormFields event={event} clientOptions={clientOptions} />
            <CalendarDialogFooter onClose={() => setIsEditing(false)} submitLabel="Salvar alteracoes" />
          </form>
        </CalendarDialog>
      ) : null}
    </div>
  );
}
