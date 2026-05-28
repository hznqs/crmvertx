import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { goalTypeLabels } from "@/lib/goals/labels";
import type { Goal } from "@/lib/types/goals";

type GoalFormFieldsProps = {
  goal?: Goal;
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function GoalFormFields({ goal }: GoalFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Tipo">
          <PremiumSelect name="type" required defaultValue={goal?.type ?? "FATURAMENTO"} options={Object.entries(goalTypeLabels).map(([value, label]) => ({ value, label }))} />
        </Field>
        <Field label="Data da meta">
          <DatePicker name="date" required defaultValue={goal?.date ?? ""} />
        </Field>
        <Field label="Ativa">
          <PremiumSelect name="active" defaultValue={goal?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativa" }, { value: "false", label: "Inativa" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Alvo">
          <FormattedInput name="target" mask="decimal" defaultValue={goal?.target ?? 0} />
        </Field>
        <Field label="Atual">
          <FormattedInput name="actual" mask="decimal" defaultValue={goal?.actual ?? 0} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Inicio do periodo">
          <DatePicker name="periodStart" defaultValue={goal?.periodStart ?? ""} />
        </Field>
        <Field label="Fim do periodo">
          <DatePicker name="periodEnd" defaultValue={goal?.periodEnd ?? ""} />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
