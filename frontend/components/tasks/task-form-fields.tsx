import { DatePicker } from "@/components/ui/date-picker";
import { PremiumSelect } from "@/components/ui/premium-select";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/tasks/labels";
import type { Task, TaskProjectOption } from "@/lib/types/tasks";

type TaskFormFieldsProps = {
  task?: Task;
  projectOptions: TaskProjectOption[];
};

const inputClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function TaskFormFields({ task, projectOptions }: TaskFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titulo">
          <input name="title" required defaultValue={task?.title ?? ""} className={inputClassName} />
        </Field>
        <Field label="Projeto">
          <PremiumSelect name="projectId" required defaultValue={task?.projectId ?? ""} placeholder="Selecione" options={[{ value: "", label: "Selecione" }, ...projectOptions.map((project) => ({ value: project.id, label: project.label }))]} searchable />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Prioridade">
          <PremiumSelect name="priority" required defaultValue={task?.priority ?? "MEDIA"} options={toOptions(taskPriorityLabels)} />
        </Field>
        <Field label="Status">
          <PremiumSelect name="status" required defaultValue={task?.status ?? "PENDENTE"} options={toOptions(taskStatusLabels)} />
        </Field>
        <Field label="Prazo">
          <DatePicker name="dueDate" required defaultValue={task?.dueDate ?? ""} />
        </Field>
        <Field label="Ativa">
          <PremiumSelect name="active" defaultValue={task?.active === false ? "false" : "true"} options={[{ value: "true", label: "Ativa" }, { value: "false", label: "Inativa" }]} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Entrega">
          <input name="deliveryId" defaultValue={task?.deliveryId ?? ""} placeholder="UUID opcional" className={inputClassName} />
        </Field>
        <Field label="Responsavel">
          <input name="responsibleUserId" defaultValue={task?.responsibleUserId ?? ""} placeholder="UUID opcional" className={inputClassName} />
        </Field>
      </div>

      <Field label="Descricao">
        <textarea
          name="description"
          defaultValue={task?.description ?? ""}
          className={`${inputClassName} min-h-28 py-3`}
        />
      </Field>
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
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
