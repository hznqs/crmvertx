import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { DashboardMetrics } from "@/lib/types/dashboard";

type DashboardCommercialProps = {
  metrics: DashboardMetrics;
};

export function DashboardCommercial({ metrics }: DashboardCommercialProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard tone="brand" label="Leads totais" value={String(metrics.totalLeads)} helper={`${metrics.totalSales} vendas`} />
      <MetricCard tone="success" label="Reunioes executadas" value={String(metrics.completedMeetings)} helper="No periodo" />
      <MetricCard tone="warning" label="Churn clientes" value={`${Number(metrics.customerChurnRate ?? 0).toFixed(1)}%`} helper={`${metrics.lostRecurringCustomers} clientes recorrentes perdidos`} />
      <MetricCard tone="danger" label="MRR perdido" value={formatCurrency(metrics.mrrLost)} helper={`${Number(metrics.mrrChurnRate ?? 0).toFixed(1)}% de MRR churn`} />
      <MetricCard tone="neutral" label="Churn contratos" value={`${Number(metrics.contractChurnRate ?? 0).toFixed(1)}%`} helper={`${metrics.nonRenewedContracts} nao renovados`} />
      <MetricCard tone="warning" label="Clientes ativos" value={String(metrics.activeClients)} helper={`${metrics.lostClients} perdidos historicos`} />
      <MetricCard tone="neutral" label="Projetos em execucao" value={String(metrics.projectsInExecution)} helper="No momento" />
    </section>
  );
}
