"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { PremiumSelect } from "@/components/ui/premium-select";
import { projectStatusLabels } from "@/lib/projects/labels";
import type { ProjectQuery, ProjectSelectOption } from "@/lib/types/projects";

type ProjectFiltersProps = {
  query: ProjectQuery;
  clientOptions: ProjectSelectOption[];
  serviceOptions: ProjectSelectOption[];
};

export function ProjectFilters({ query, clientOptions, serviceOptions }: ProjectFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof ProjectQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
        <input
          defaultValue={query.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Buscar por nome, descricao, equipe ou responsavel"
          className="min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <PremiumSelect value={query.clientId} onChange={(value) => updateFilter("clientId", value)} placeholder="Todos os clientes" options={[{ value: "", label: "Todos os clientes" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]} searchable />
        <PremiumSelect value={query.serviceId} onChange={(value) => updateFilter("serviceId", value)} placeholder="Todos os servicos" options={[{ value: "", label: "Todos os servicos" }, ...serviceOptions.map((service) => ({ value: service.id, label: service.label }))]} searchable />
        <PremiumSelect value={query.status} onChange={(value) => updateFilter("status", value)} placeholder="Status" options={[{ value: "", label: "Status" }, ...Object.entries(projectStatusLabels).map(([value, label]) => ({ value, label }))]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <DatePicker value={query.slaFrom} onChange={(value) => updateFilter("slaFrom", value)} />
        <DatePicker value={query.slaTo} onChange={(value) => updateFilter("slaTo", value)} />
        <PremiumSelect value={query.active} onChange={(value) => updateFilter("active", value)} placeholder="Todos" options={[{ value: "", label: "Todos" }, { value: "true", label: "Ativos" }, { value: "false", label: "Inativos" }]} />
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}
