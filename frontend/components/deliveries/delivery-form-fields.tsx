import { deliveryStatusLabels, deliveryTypeSuggestions } from "@/lib/deliveries/labels";
import { deliveryKanbanStatuses } from "@/lib/deliveries/kanban";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { Delivery, DeliverySelectOption } from "@/lib/types/deliveries";

type DeliveryFormFieldsProps = {
  delivery?: Delivery;
  clientOptions: DeliverySelectOption[];
  projectOptions: DeliverySelectOption[];
  contractOptions: DeliverySelectOption[];
  serviceOptions: DeliverySelectOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function DeliveryFormFields({
  delivery,
  clientOptions,
  projectOptions,
  contractOptions,
  serviceOptions
}: DeliveryFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <Field label="Titulo">
          <input name="title" required defaultValue={delivery?.title ?? ""} className={inputClassName} />
        </Field>
        <Field label="Tipo">
          <PremiumSelect name="type" required defaultValue={delivery?.type ?? deliveryTypeSuggestions[0] ?? ""} options={deliveryTypeSuggestions.map((type) => ({ value: type, label: type }))} searchable />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={delivery?.status ?? "backlog"} options={deliveryKanbanStatuses.map((value) => ({ value, label: deliveryStatusLabels[value] }))} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Responsavel">
          <input name="owner" required defaultValue={delivery?.owner ?? ""} className={inputClassName} />
        </Field>
        <Field label="Prazo">
          <DatePicker name="deadline" required defaultValue={delivery?.deadline ?? ""} />
        </Field>
        <Field label="Prioridade">
          <PremiumSelect
            name="priority"
            required
            defaultValue={delivery?.priority ?? "MEDIA"}
            options={[
              { value: "BAIXA", label: "Baixa" },
              { value: "MEDIA", label: "Media" },
              { value: "ALTA", label: "Alta" },
              { value: "URGENTE", label: "Urgente" }
            ]}
          />
        </Field>
        <Field label="Ativa">
          <PremiumSelect name="active" defaultValue={delivery?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativa" }, { value: "false", label: "Inativa" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Cliente">
          <OptionSelect name="clientId" value={delivery?.clientId} options={clientOptions} />
        </Field>
        <Field label="Projeto">
          <OptionSelect name="projectId" value={delivery?.projectId} options={projectOptions} />
        </Field>
        <Field label="Contrato">
          <OptionSelect name="contractId" value={delivery?.contractId} options={contractOptions} />
        </Field>
        <Field label="Servico">
          <OptionSelect name="serviceId" value={delivery?.serviceId} options={serviceOptions} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <Field label="Progresso">
          <FormattedInput name="progress" mask="percentage" defaultValue={delivery?.progress ?? 0} />
        </Field>
        <Field label="Tags">
          <input name="tags" defaultValue={delivery?.tags ?? ""} className={inputClassName} placeholder="site, urgente, mensalista" />
        </Field>
      </div>

      <Field label="Descricao">
        <textarea name="description" defaultValue={delivery?.description ?? ""} className={`${inputClassName} min-h-28 py-3`} />
      </Field>
    </div>
  );
}

function OptionSelect({
  name,
  value,
  options
}: Readonly<{
  name: string;
  value: string | null | undefined;
  options: DeliverySelectOption[];
}>) {
  return (
    <PremiumSelect name={name} defaultValue={value ?? ""} placeholder="Nao vinculado" options={[{ value: "", label: "Nao vinculado" }, ...options.map((option) => ({ value: option.id, label: option.label }))]} searchable />
  );
}

function Field({
  label,
  children
}: Readonly<{
  label: string;
  children: React.ReactNode;
}>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
