"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PremiumSelect } from "@/components/ui/premium-select";
import {
  clientPhaseLabels,
  clientPriorityLabels,
  clientStatusLabels
} from "@/lib/clients/labels";
import type { ClientQuery } from "@/lib/types/clients";

type ClientFiltersProps = {
  query: ClientQuery;
};

export function ClientFilters({ query }: ClientFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof ClientQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) nextParams.set(name, value);
    else nextParams.delete(name);

    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          defaultValue={query.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Buscar por empresa, contato, email, telefone ou documento"
          className="min-h-11 flex-1 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <PremiumSelect value={query.phase} onChange={(value) => updateFilter("phase", value)} placeholder="Todas as fases" options={[{ value: "", label: "Todas as fases" }, ...toOptions(clientPhaseLabels)]} />
          <PremiumSelect value={query.status} onChange={(value) => updateFilter("status", value)} placeholder="Todos os status" options={[{ value: "", label: "Todos os status" }, ...toOptions(clientStatusLabels)]} />
          <PremiumSelect value={query.priority} onChange={(value) => updateFilter("priority", value)} placeholder="Prioridade" options={[{ value: "", label: "Prioridade" }, ...toOptions(clientPriorityLabels)]} />
        </div>
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
