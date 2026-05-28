"use client";

import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { commercialStageLabels } from "@/lib/leads/labels";
import { pipelineStages, sumPotentialValue } from "@/lib/pipeline/metrics";
import { chartColors, chartTooltipStyle } from "@/lib/theme/chart";
import type { Lead } from "@/lib/types/leads";

type PipelineAnalyticsProps = {
  leads: Lead[];
};

export function PipelineAnalytics({ leads }: PipelineAnalyticsProps) {
  const stageData = pipelineStages.map((stage) => {
    const stageLeads = leads.filter((lead) => lead.commercialStage === stage);
    return {
      stage: commercialStageLabels[stage],
      total: stageLeads.length,
      value: sumPotentialValue(stageLeads)
    };
  });
  const revenueCurve = stageData.map((item, index) => ({
    name: item.stage,
    value: stageData.slice(index).reduce((total, current) => total + current.value, 0)
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="crm-surface p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-400">Performance comercial</p>
        <h2 className="mt-1 text-lg font-black text-white">Valor por etapa</h2>
        <div className="mt-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="stage" tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(Number(value)).replace(",00", "")} />
              <Tooltip
                cursor={{ fill: chartColors.cursor }}
                contentStyle={chartTooltipStyle}
                formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
              />
              <Bar dataKey="value" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="crm-surface p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-400">Forecast</p>
        <h2 className="mt-1 text-lg font-black text-white">Receita ponderada visual</h2>
        <div className="mt-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueCurve} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} hide />
              <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} hide />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) => [formatCurrency(Number(value)), "Forecast"]}
              />
              <Area type="monotone" dataKey="value" stroke={chartColors.brand} strokeWidth={2.5} fill="rgba(234,89,220,.18)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
