import { MetricCard } from "@/components/app/metric-card";
import { formatCurrency } from "@/lib/formatters";
import type { ClientPerformanceRecord } from "@/lib/types/performance";

type PerformanceMetricsProps = {
  records: ClientPerformanceRecord[];
  totalElements: number;
};

export function PerformanceMetrics({ records, totalElements }: PerformanceMetricsProps) {
  const leads = records.reduce((total, record) => total + Number(record.leads ?? 0), 0);
  const sales = records.reduce((total, record) => total + Number(record.sales ?? 0), 0);
  const revenue = records.reduce((total, record) => total + Number(record.revenue ?? 0), 0);
  const investment = records.reduce((total, record) => total + Number(record.investment ?? 0), 0);
  const cpl = leads > 0 ? investment / leads : 0;
  const conversion = leads > 0 ? (sales / leads) * 100 : 0;
  const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Registros" value={String(totalElements)} helper={`${leads} leads gerados`} />
      <MetricCard label="CPL medio" value={formatCurrency(cpl)} helper="Investimento / leads" />
      <MetricCard label="Conversao" value={`${conversion.toFixed(1)}%`} helper={`${sales} vendas`} />
      <MetricCard label="ROI" value={`${roi.toFixed(1)}%`} helper={formatCurrency(revenue)} />
    </section>
  );
}
