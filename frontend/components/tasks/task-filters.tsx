"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { PremiumSelect } from "@/components/ui/premium-select";
import { taskPriorityLabels, taskStatusLabels } from "@/lib/tasks/labels";
import type { TaskProjectOption, TaskQuery } from "@/lib/types/tasks";

type TaskFiltersProps = {
  query: TaskQuery;
  projectOptions: TaskProjectOption[];
};

export function TaskFilters({ query, projectOptions }: TaskFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof TaskQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]">
        <input
          defaultValue={query.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Buscar por titulo, descricao ou responsavel"
          className="min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <PremiumSelect value={query.projectId} onChange={(value) => updateFilter("projectId", value)} placeholder="Todos os projetos" options={[{ value: "", label: "Todos os projetos" }, ...projectOptions.map((project) => ({ value: project.id, label: project.label }))]} searchable />
        <PremiumSelect value={query.priority} onChange={(value) => updateFilter("priority", value)} placeholder="Prioridade" options={[{ value: "", label: "Prioridade" }, ...toOptions(taskPriorityLabels)]} />
        <PremiumSelect value={query.status} onChange={(value) => updateFilter("status", value)} placeholder="Status" options={[{ value: "", label: "Status" }, ...toOptions(taskStatusLabels)]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <DatePicker value={query.dueFrom} onChange={(value) => updateFilter("dueFrom", value)} />
        <DatePicker value={query.dueTo} onChange={(value) => updateFilter("dueTo", value)} />
        <PremiumSelect value={query.active} onChange={(value) => updateFilter("active", value)} placeholder="Todas" options={[{ value: "", label: "Todas" }, { value: "true", label: "Ativas" }, { value: "false", label: "Inativas" }]} />
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
