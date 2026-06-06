import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { TimePicker } from "@/components/ui/time-picker";
import { calendarEventPriorityLabels, calendarEventRecurrenceLabels, calendarEventStatusLabels, calendarEventTypeLabels } from "@/lib/calendar/labels";
import type { CalendarClientOption, CalendarEvent, CalendarRelationOption } from "@/lib/types/calendar";

type CalendarEventFormFieldsProps = {
  event?: CalendarEvent;
  clientOptions: CalendarClientOption[];
  leadOptions: CalendarRelationOption[];
  contractOptions: CalendarRelationOption[];
  projectOptions: CalendarRelationOption[];
  taskOptions: CalendarRelationOption[];
};

const inputClassName = "crm-control w-full";

export function CalendarEventFormFields({
  event,
  clientOptions,
  leadOptions,
  contractOptions,
  projectOptions,
  taskOptions
}: CalendarEventFormFieldsProps) {
  const meetingUrl = event?.meetingUrl ?? event?.meetingLink ?? "";

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr]">
        <Field label="Titulo do evento">
          <input name="title" required defaultValue={event?.title ?? ""} className={inputClassName} />
        </Field>
        <Field label="Tipo">
          <PremiumSelect name="type" required defaultValue={event?.type ?? "ONLINE"} options={toOptions(calendarEventTypeLabels)} />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={event?.status ?? "agendada"} options={toOptions(calendarEventStatusLabels)} />
        </Field>
        <Field label="Prioridade">
          <PremiumSelect name="priority" required defaultValue={event?.priority ?? "media"} options={toOptions(calendarEventPriorityLabels)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr]">
        <Field label="Data inicial">
          <DatePicker name="date" required defaultValue={event?.date ?? ""} />
        </Field>
        <Field label="Data final">
          <DatePicker name="endDate" defaultValue={event?.endDate ?? event?.date ?? ""} />
        </Field>
        <Field label="Inicio">
          <TimePicker name="startTime" defaultValue={(event?.startTime ?? event?.time)?.slice(0, 5) ?? ""} />
        </Field>
        <Field label="Termino">
          <TimePicker name="endTime" defaultValue={event?.endTime?.slice(0, 5) ?? ""} />
        </Field>
        <Field label="Dia inteiro">
          <PremiumSelect name="allDay" defaultValue={event?.allDay ? "true" : "false"} options={[{ value: "false", label: "Nao" }, { value: "true", label: "Sim" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr]">
        <Field label="Cliente">
          <PremiumSelect name="clientId" defaultValue={event?.clientId ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]} searchable />
        </Field>
        <Field label="Lead">
          <PremiumSelect name="leadId" defaultValue={event?.leadId ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...leadOptions.map(toSelectOption)]} searchable />
        </Field>
        <Field label="Contrato">
          <PremiumSelect name="contractId" defaultValue={event?.contractId ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...contractOptions.map(toSelectOption)]} searchable />
        </Field>
        <Field label="Projeto">
          <PremiumSelect name="projectId" defaultValue={event?.projectId ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...projectOptions.map(toSelectOption)]} searchable />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
        <Field label="Tarefa vinculada">
          <PremiumSelect name="taskId" defaultValue={event?.taskId ?? ""} placeholder="Nao vinculada" options={[{ value: "", label: "Nao vinculada" }, ...taskOptions.map(toSelectOption)]} searchable />
        </Field>
        <Field label="Responsavel">
          <input name="responsible" defaultValue={event?.responsible ?? ""} placeholder="Nome do responsavel" className={inputClassName} />
        </Field>
        <Field label="Lembrete">
          <PremiumSelect
            name="reminderMinutesBefore"
            defaultValue={String(event?.reminderMinutesBefore ?? 15)}
            options={[
              { value: "0", label: "No horario" },
              { value: "5", label: "5 minutos antes" },
              { value: "15", label: "15 minutos antes" },
              { value: "30", label: "30 minutos antes" },
              { value: "60", label: "1 hora antes" },
              { value: "1440", label: "1 dia antes" }
            ]}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr]">
        <Field label="Link da reuniao">
          <input name="meetingUrl" type="url" defaultValue={meetingUrl} placeholder="https://meet.google.com/..." className={inputClassName} />
        </Field>
        <Field label="Local presencial">
          <input name="location" defaultValue={event?.location ?? ""} placeholder="Endereco, sala ou unidade" className={inputClassName} />
        </Field>
        <Field label="Recorrencia">
          <PremiumSelect name="recurrenceRule" defaultValue={event?.recurrenceRule ?? "NONE"} options={toOptions(calendarEventRecurrenceLabels)} />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={event?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativo" }, { value: "false", label: "Inativo" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[160px_1fr_1fr]">
        <Field label="Venda">
          <PremiumSelect name="sale" defaultValue={event?.sale ? "true" : "false"} options={[{ value: "false", label: "Nao" }, { value: "true", label: "Sim" }]} />
        </Field>
        <Field label="Receita">
          <FormattedInput name="revenue" mask="currency" defaultValue={event?.revenue ?? 0} />
        </Field>
        <Field label="Participantes">
          <input name="participants" defaultValue={event?.participants ?? ""} placeholder="Equipe, cliente, convidados" className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Descricao">
          <textarea name="description" defaultValue={event?.description ?? ""} className={`${inputClassName} min-h-24 py-3`} />
        </Field>
        <Field label="Observacoes internas">
          <textarea name="notes" defaultValue={event?.notes ?? ""} className={`${inputClassName} min-h-24 py-3`} />
        </Field>
      </div>
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function toSelectOption(option: CalendarRelationOption) {
  return {
    value: option.id,
    label: option.label,
    description: option.description
  };
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
