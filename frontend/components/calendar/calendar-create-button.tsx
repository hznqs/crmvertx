"use client";

import { useState } from "react";
import { createCalendarEventAction } from "@/lib/calendar/actions";
import type { CalendarClientOption, CalendarRelationOption } from "@/lib/types/calendar";
import { CalendarDialog } from "@/components/calendar/calendar-dialog";
import { CalendarEventFormFields } from "@/components/calendar/calendar-event-form-fields";
import { CalendarSubmitButton } from "@/components/calendar/calendar-submit-button";
import { ModalFooter } from "@/components/ui/modal-dialog";
import { SafeActionForm } from "@/components/ui/safe-action-form";

type CalendarCreateButtonProps = {
  clientOptions: CalendarClientOption[];
  leadOptions: CalendarRelationOption[];
  contractOptions: CalendarRelationOption[];
  projectOptions: CalendarRelationOption[];
  taskOptions: CalendarRelationOption[];
};

export function CalendarCreateButton({
  clientOptions,
  leadOptions,
  contractOptions,
  projectOptions,
  taskOptions
}: CalendarCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-bold text-white shadow-panel transition hover:brightness-110">
        Nova reuniao
      </button>
      {isOpen ? (
        <CalendarDialog title="Nova reuniao" eyebrow="Agenda operacional" onClose={() => setIsOpen(false)}>
          <SafeActionForm action={createCalendarEventAction} onSuccess={() => setIsOpen(false)} className="mt-5 space-y-5">
            <CalendarEventFormFields
              clientOptions={clientOptions}
              leadOptions={leadOptions}
              contractOptions={contractOptions}
              projectOptions={projectOptions}
              taskOptions={taskOptions}
            />
            <CalendarDialogFooter onClose={() => setIsOpen(false)} submitLabel="Salvar reuniao" />
          </SafeActionForm>
        </CalendarDialog>
      ) : null}
    </>
  );
}

export function CalendarDialogFooter({
  onClose,
  submitLabel
}: Readonly<{
  onClose: () => void;
  submitLabel: string;
}>) {
  return (
    <ModalFooter onClose={onClose}>
      <CalendarSubmitButton idleLabel={submitLabel} pendingLabel="Salvando..." />
    </ModalFooter>
  );
}
