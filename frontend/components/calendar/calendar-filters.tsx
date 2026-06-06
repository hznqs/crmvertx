"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { MonthPicker } from "@/components/ui/month-picker";
import { PremiumSelect } from "@/components/ui/premium-select";
import {
  getAdjacentMonth,
  getMonthLabel,
  toMonthKey
} from "@/lib/calendar/date-utils";
import {
  calendarEventPriorityLabels,
  calendarEventStatusLabels,
  calendarEventTypeLabels
} from "@/lib/calendar/labels";
import type { CalendarClientOption, CalendarQuery, CalendarRelationOption } from "@/lib/types/calendar";

type CalendarFiltersProps = {
  query: CalendarQuery;
  clientOptions: CalendarClientOption[];
  leadOptions: CalendarRelationOption[];
  contractOptions: CalendarRelationOption[];
  projectOptions: CalendarRelationOption[];
  taskOptions: CalendarRelationOption[];
};

const controlClassName = "crm-control w-full";

export function CalendarFilters({
  query,
  clientOptions,
  leadOptions,
  contractOptions,
  projectOptions,
  taskOptions
}: CalendarFiltersProps) {
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
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    });
  }

  function hrefWithFilter(name: keyof CalendarQuery, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (value) {
      nextParams.set(name, value);
    } else {
      nextParams.delete(name);
    }
    const nextQuery = nextParams.toString();
    return nextQuery ? `${pathname}?${nextQuery}` : pathname;
  }

  return (
    <div className="crm-filter-panel w-full max-w-full p-2 2xl:w-auto">
      <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center">
        <div className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] gap-2 xl:w-72">
          <Link
            href={hrefWithFilter("month", getAdjacentMonth(query.month, -1))}
            className="crm-icon-button"
            aria-label="Mes anterior"
          >
            ‹
          </Link>
          {query.view === "month" ? (
            <MonthPicker
              value={query.month}
              onChange={(value) => updateFilter("month", value)}
              ariaLabel={getMonthLabel(query.month)}
            />
          ) : (
            <DatePicker value={query.date} onChange={(value) => updateFilter("date", value)} />
          )}
          <Link
            href={hrefWithFilter("month", getAdjacentMonth(query.month, 1))}
            className="crm-icon-button"
            aria-label="Proximo mes"
          >
            ›
          </Link>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-6">
          <PremiumSelect
            value={query.view}
            onChange={(value) => updateFilter("view", value)}
            options={[
              { value: "month", label: "Mes" },
              { value: "week", label: "Semana" },
              { value: "day", label: "Dia" }
            ]}
          />

          <PremiumSelect
            value={query.clientId}
            onChange={(value) => updateFilter("clientId", value)}
            placeholder="Cliente"
            options={[{ value: "", label: "Cliente" }, ...clientOptions.map((client) => ({ value: client.id, label: client.label }))]}
            searchable
          />

          <PremiumSelect
            value={query.leadId}
            onChange={(value) => updateFilter("leadId", value)}
            placeholder="Lead"
            options={[{ value: "", label: "Lead" }, ...leadOptions.map(toSelectOption)]}
            searchable
          />

          <PremiumSelect
            value={query.contractId}
            onChange={(value) => updateFilter("contractId", value)}
            placeholder="Contrato"
            options={[{ value: "", label: "Contrato" }, ...contractOptions.map(toSelectOption)]}
            searchable
          />

          <PremiumSelect
            value={query.projectId}
            onChange={(value) => updateFilter("projectId", value)}
            placeholder="Projeto"
            options={[{ value: "", label: "Projeto" }, ...projectOptions.map(toSelectOption)]}
            searchable
          />

          <PremiumSelect
            value={query.taskId}
            onChange={(value) => updateFilter("taskId", value)}
            placeholder="Tarefa"
            options={[{ value: "", label: "Tarefa" }, ...taskOptions.map(toSelectOption)]}
            searchable
          />

          <input
            value={query.responsible}
            onChange={(event) => updateFilter("responsible", event.target.value)}
            placeholder="Responsavel"
            className={controlClassName}
          />

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

          <PremiumSelect
            value={query.priority}
            onChange={(value) => updateFilter("priority", value)}
            placeholder="Prioridade"
            options={[{ value: "", label: "Prioridade" }, ...Object.entries(calendarEventPriorityLabels).map(([value, label]) => ({ value, label }))]}
          />

          <Link
            href={hrefWithFilter("month", toMonthKey(new Date()))}
            className="crm-button-secondary min-h-11"
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

function toSelectOption(option: CalendarRelationOption) {
  return {
    value: option.id,
    label: option.label,
    description: option.description
  };
}
