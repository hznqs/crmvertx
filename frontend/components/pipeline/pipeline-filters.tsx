"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PremiumSelect } from "@/components/ui/premium-select";
import { leadOriginLabels, leadStatusLabels, leadTemperatureLabels } from "@/lib/leads/labels";
import type { LeadQuery } from "@/lib/types/leads";

type PipelineFiltersProps = {
  query: LeadQuery;
};

export function PipelineFilters({ query }: PipelineFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof LeadQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
        <input
          defaultValue={query.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Buscar por lead, empresa, email ou segmento"
          className="min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <PremiumSelect value={query.temperature} onChange={(value) => updateFilter("temperature", value)} placeholder="Temperatura" options={[{ value: "", label: "Temperatura" }, ...toOptions(leadTemperatureLabels)]} />
        <PremiumSelect value={query.origin} onChange={(value) => updateFilter("origin", value)} placeholder="Origem" options={[{ value: "", label: "Origem" }, ...toOptions(leadOriginLabels)]} />
        <PremiumSelect value={query.status} onChange={(value) => updateFilter("status", value)} placeholder="Status" options={[{ value: "", label: "Status" }, ...toOptions(leadStatusLabels)]} />
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
