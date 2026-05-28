"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PremiumSelect } from "@/components/ui/premium-select";
import { teamRoleOptions } from "@/lib/team/labels";
import type { TeamQuery } from "@/lib/types/team";

type TeamFiltersProps = {
  query: TeamQuery;
};

export function TeamFilters({ query }: TeamFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof TeamQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) nextParams.set(name, value);
    else nextParams.delete(name);
    nextParams.set("page", "0");
    startTransition(() => router.replace(`${pathname}?${nextParams.toString()}`));
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_140px]">
        <input
          defaultValue={query.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Buscar por nome"
          className="min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15"
        />
        <PremiumSelect value={query.role} onChange={(value) => updateFilter("role", value)} placeholder="Todos os cargos" options={[{ value: "", label: "Todos os cargos" }, ...teamRoleOptions]} searchable />
        <PremiumSelect value={String(query.size)} onChange={(value) => updateFilter("size", value)} options={pageSizeOptions} />
      </div>
      {isPending ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}

const pageSizeOptions = [
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" }
];
