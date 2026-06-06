import { teamRoleOptions } from "@/lib/team/labels";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { TeamMember } from "@/lib/types/team";

type TeamFormFieldsProps = {
  member?: TeamMember;
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function TeamFormFields({ member }: TeamFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <Field label="Nome">
          <input name="name" required defaultValue={member?.name ?? ""} className={inputClassName} />
        </Field>
        <Field label="Cargo">
          <PremiumSelect name="role" required defaultValue={member?.role ?? teamRoleOptions[0]?.value ?? ""} options={teamRoleOptions} searchable />
        </Field>
        <input type="hidden" name="userId" value={member?.userId ?? ""} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Funcao">
          <input name="functionName" defaultValue={member?.functionName ?? ""} className={inputClassName} placeholder="Ex.: Gestor de trafego, designer" />
        </Field>
        <Field label="Data de entrada">
          <DatePicker name="joinedAt" defaultValue={member?.joinedAt ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Email">
          <FormattedInput name="email" mask="email" defaultValue={member?.email ?? ""} placeholder="pessoa@empresa.com" />
        </Field>
        <Field label="Telefone">
          <FormattedInput name="phone" mask="phone" defaultValue={member?.phone ?? ""} placeholder="(11) 99999-9999" />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={member?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativo" }, { value: "false", label: "Inativo" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Tarefas">
          <FormattedInput name="tasks" mask="integer" defaultValue={member?.tasks ?? 0} />
        </Field>
        <Field label="Concluidas">
          <FormattedInput name="completed" mask="integer" defaultValue={member?.completed ?? 0} />
        </Field>
        <Field label="Performance">
          <FormattedInput name="performance" mask="percentage" defaultValue={member?.performance ?? 0} />
        </Field>
        <Field label="Capacidade mensal">
          <FormattedInput name="capacityHoursMonth" mask="integer" defaultValue={member?.capacityHoursMonth ?? 160} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Custo hora">
          <FormattedInput name="hourlyCost" mask="currency" defaultValue={member?.hourlyCost ?? 0} />
        </Field>
        <Field label="Distribuicao de tarefas">
          <input name="taskBreakdown" defaultValue={member?.taskBreakdown ?? ""} placeholder="ex.: design 40%, revisao 30%" className={inputClassName} />
        </Field>
      </div>

      <Field label="Notas">
        <textarea name="notes" defaultValue={member?.notes ?? ""} className={`${inputClassName} min-h-28 py-3`} />
      </Field>
    </div>
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
