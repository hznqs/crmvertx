"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  getAdjacentMonth,
  getMonthLabel,
  toMonthKey
} from "@/lib/calendar/date-utils";
import { PremiumSelect } from "@/components/ui/premium-select";
import {
  calendarEventStatusLabels,
  calendarEventTypeLabels
} from "@/lib/calendar/labels";
import type { CalendarQuery } from "@/lib/types/calendar";

type CalendarFiltersProps = {
  query: CalendarQuery;
};

const controlClassName =
  "min-h-11 rounded-lg border border-line bg-white/[0.045] px-3 text-sm font-medium text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-600/15";

export function CalendarFilters({ query }: CalendarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(name: keyof CalendarQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`);
    });
  }

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-panel/80 p-2 shadow-panel xl:w-auto">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2 lg:w-72">
          <Link
            href={`/calendar?month=${getAdjacentMonth(query.month, -1)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white/[0.055] text-lg text-zinc-200 transition hover:bg-white/[0.09]"
            aria-label="Mes anterior"
          >
            ‹
          </Link>
          <input
            type="month"
            value={query.month}
            onChange={(event) => updateFilter("month", event.target.value)}
            aria-label={getMonthLabel(query.month)}
            className={controlClassName}
          />
          <Link
            href={`/calendar?month=${getAdjacentMonth(query.month, 1)}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white/[0.055] text-lg text-zinc-200 transition hover:bg-white/[0.09]"
            aria-label="Proximo mes"
          >
            ›
          </Link>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <PremiumSelect
            value={query.status}
            onChange={(value) => updateFilter("status", value)}
            placeholder="Todos os status"
            options={[{ value: "", label: "Todos os status" }, ...Object.entries(calendarEventStatusLabels).map(([value, label]) => ({ value, label }))]}
          />

          <PremiumSelect
            value={query.type}
            onChange={(value) => updateFilter("type", value)}
            placeholder="Todos os tipos"
            options={[{ value: "", label: "Todos os tipos" }, ...Object.entries(calendarEventTypeLabels).map(([value, label]) => ({ value, label }))]}
          />

          <Link
            href={`/calendar?month=${toMonthKey(new Date())}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white/[0.055] px-4 text-sm font-bold text-white transition hover:bg-white/[0.09]"
          >
            Hoje
          </Link>
        </div>
      </div>

      {isPending ? (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-400" />
        </div>
      ) : null}
    </div>
  );
}
