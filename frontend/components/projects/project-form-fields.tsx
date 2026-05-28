import { projectStatusLabels } from "@/lib/projects/labels";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedInput } from "@/components/ui/formatted-input";
import { PremiumSelect } from "@/components/ui/premium-select";
import type { Project, ProjectSelectOption } from "@/lib/types/projects";

type ProjectFormFieldsProps = {
  project?: Project;
  clientOptions: ProjectSelectOption[];
  serviceOptions: ProjectSelectOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function ProjectFormFields({
  project,
  clientOptions,
  serviceOptions
}: ProjectFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do projeto">
          <input name="name" required defaultValue={project?.name ?? ""} className={inputClassName} />
        </Field>
        <Field label="Cliente">
          <PremiumSelect name="clientId" required defaultValue={project?.clientId ?? ""} placeholder="Selecione" options={selectOptions(clientOptions, "Selecione")} searchable />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={project?.status ?? "PLANEJAMENTO"} options={toOptions(projectStatusLabels)} />
        </Field>
        <Field label="Progresso">
          <FormattedInput name="progress" mask="percentage" required defaultValue={project?.progress ?? 0} />
        </Field>
        <Field label="SLA">
          <DatePicker name="slaDueDate" defaultValue={project?.slaDueDate ?? ""} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Servico">
          <PremiumSelect name="serviceId" defaultValue={project?.serviceId ?? ""} placeholder="Nao vinculado" options={selectOptions(serviceOptions, "Nao vinculado")} searchable />
        </Field>
        <Field label="Contrato">
          <input name="contractId" defaultValue={project?.contractId ?? ""} placeholder="UUID opcional" className={inputClassName} />
        </Field>
        <Field label="Responsavel">
          <input name="responsibleUserId" defaultValue={project?.responsibleUserId ?? ""} placeholder="UUID opcional" className={inputClassName} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Orcamento">
          <FormattedInput name="budget" mask="currency" required defaultValue={project?.budget ?? 0} />
        </Field>
        <Field label="Custo estimado">
          <FormattedInput name="estimatedCost" mask="currency" required defaultValue={project?.estimatedCost ?? 0} />
        </Field>
        <Field label="Custo real">
          <FormattedInput name="actualCost" mask="currency" required defaultValue={project?.actualCost ?? 0} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <Field label="Equipe">
          <input name="teamMemberIds" defaultValue={project?.teamMemberIds ?? ""} placeholder="IDs ou nomes separados por virgula" className={inputClassName} />
        </Field>
        <Field label="Ativo">
          <PremiumSelect name="active" defaultValue={project?.active === false ? "false" : "true"} options={booleanOptions("Ativo", "Inativo")} />
        </Field>
      </div>

      <Field label="Descricao">
        <textarea
          name="description"
          defaultValue={project?.description ?? ""}
          className={`${inputClassName} min-h-28 py-3`}
        />
      </Field>
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

function selectOptions(options: ProjectSelectOption[], emptyLabel: string) {
  return [{ value: "", label: emptyLabel }, ...options.map((option) => ({ value: option.id, label: option.label }))];
}

function booleanOptions(trueLabel: string, falseLabel: string) {
  return [{ value: "true", label: trueLabel }, { value: "false", label: falseLabel }];
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
