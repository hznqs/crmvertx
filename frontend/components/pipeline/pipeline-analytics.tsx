"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { commercialStageLabels } from "@/lib/leads/labels";
import { pipelineStages, sumPotentialValue } from "@/lib/pipeline/metrics";
import { chartColors } from "@/lib/theme/chart";
import type { Lead } from "@/lib/types/leads";
import { ChartFrame } from "@/components/ui/chart-frame";
import { ChartCard, ChartEmptyState, PremiumChartTooltip } from "@/components/ui/premium-chart";

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
  const hasData = stageData.some((item) => item.total > 0 || item.value > 0);
  const totalPipelineValue = stageData.reduce((total, item) => total + item.value, 0);

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <ChartCard
        eyebrow="Performance comercial"
        title="Valor por etapa"
        subtitle="Distribuicao do valor potencial em cada fase do funil."
        metric={formatCurrency(totalPipelineValue)}
        badge={`${leads.length} leads`}
      >
        <ChartFrame className="mt-6 h-60 min-h-60 min-w-0 overflow-hidden rounded-xl border border-brand-400/10 bg-[#090909]/30 p-3">
          {hasData ? (
            ({ width, height }) => (
            <BarChart width={width} height={height} data={stageData} margin={{ left: -8, right: 8, top: 12, bottom: 0 }}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} strokeDasharray="4 8" />
              <XAxis dataKey="stage" tick={{ fill: chartColors.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(Number(value)).replace(",00", "")} />
              <Tooltip
                cursor={{ fill: chartColors.cursor }}
                content={<PremiumChartTooltip valueFormatter={(value) => formatCurrency(Number(value))} />}
              />
              <Bar dataKey="value" name="Valor" fill={chartColors.primary} radius={[10, 10, 0, 0]} maxBarSize={42} />
            </BarChart>
            )
          ) : (
            () => <ChartEmptyState title="Sem oportunidades no pipeline" description="Quando os leads tiverem valor potencial, a distribuicao por etapa aparecera aqui." />
          )}
        </ChartFrame>
      </ChartCard>
      <ChartCard
        eyebrow="Forecast"
        title="Receita ponderada visual"
        subtitle="Curva acumulada para leitura rapida do potencial comercial."
        metric={formatCurrency(revenueCurve[0]?.value ?? 0)}
        badge="Funil"
      >
        <ChartFrame className="mt-6 h-60 min-h-60 min-w-0 overflow-hidden rounded-xl border border-brand-400/10 bg-[#090909]/30 p-3">
          {hasData ? (
            ({ width, height }) => (
            <AreaChart width={width} height={height} data={revenueCurve} margin={{ left: -8, right: 8, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="pipelineForecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.brand} stopOpacity={0.55} />
                  <stop offset="95%" stopColor={chartColors.brand} stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} hide />
              <YAxis tick={{ fill: chartColors.muted, fontSize: 11 }} axisLine={false} tickLine={false} hide />
              <Tooltip
                content={<PremiumChartTooltip valueFormatter={(value) => formatCurrency(Number(value))} />}
              />
              <Area type="monotone" dataKey="value" name="Forecast" stroke={chartColors.brand} strokeWidth={2.8} fill="url(#pipelineForecastGradient)" />
            </AreaChart>
            )
          ) : (
            () => <ChartEmptyState title="Forecast indisponivel" description="O forecast aparece quando houver oportunidades com valor potencial." />
          )}
        </ChartFrame>
      </ChartCard>
    </section>
  );
}
