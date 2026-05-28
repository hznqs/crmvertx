import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { calendarEventStatusLabels, calendarEventTypeLabels } from "@/lib/calendar/labels";
import type { CalendarClientOption, CalendarEvent } from "@/lib/types/calendar";

type CalendarEventFormFieldsProps = {
  event?: CalendarEvent;
  clientOptions: CalendarClientOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function CalendarEventFormFields({ event, clientOptions }: CalendarEventFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
        <Field label="Titulo">
          <input name="title" required defaultValue={event?.title ?? ""} className={inputClassName} />
        </Field>
        <Field label="Tipo">
          <PremiumSelect name="type" required defaultValue={event?.type ?? "REUNIAO"} options={toOptions(calendarEventTypeLabels)} />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={event?.status ?? "agendada"} options={toOptions(calendarEventStatusLabels)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Data">
          <DatePicker name="date" required defaultValue={event?.date ?? ""} />
        </Field>
        <Field label="Horario">
          <input name="time" type="time" defaultValue={event?.time?.slice(0, 5) ?? ""} className={inputClassName} />
        </Field>
        <Field label="Venda">
          <PremiumSelect name="sale" defaultValue={event?.sale ? "true" : "false"} options={[{ value: "false", label: "Nao" }, { value: "true", label: "Sim" }]} />
        </Field>
        <Field label="Receita">
          <FormattedInput name="revenue" mask="currency" defaultValue={event?.revenue ?? 0} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Field label="Cliente">
          <PremiumSelect name="clientId" defaultValue={event?.clientId ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]} searchable />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={event?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativo" }, { value: "false", label: "Inativo" }]} />
        </Field>
      </div>

      <Field label="Notas">
        <textarea name="notes" defaultValue={event?.notes ?? ""} className={`${inputClassName} min-h-28 py-3`} />
      </Field>
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
