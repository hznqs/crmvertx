import { MetricCard } from "@/components/app/metric-card";
import type { BackendPage } from "@/lib/api/backend";

type ModuleKpisProps = {
  page: BackendPage<Record<string, unknown>>;
};

export function ModuleKpis({ page }: ModuleKpisProps) {
  const activeRecords = page.content.filter((record) => record.active !== false).length;
  const statusCount = countUniqueValues(page.content, "status");
  const totalValue = sumLikelyMoneyValues(page.content);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <MetricCard
        label="Registros"
        value={String(page.totalElements)}
        helper="Consulta server-side do modulo"
      />
      <MetricCard
        label="Ativos na pagina"
        value={String(activeRecords)}
        helper="Base operacional carregada"
      />
      <MetricCard
        label="Status distintos"
        value={String(statusCount)}
        helper={totalValue > 0 ? `Valor identificado: ${totalValue.toLocaleString("pt-BR")}` : "Qualidade do funil"}
      />
    </section>
  );
}

function countUniqueValues(records: Record<string, unknown>[], key: string) {
  return new Set(records.map((record) => record[key]).filter(Boolean)).size;
}

function sumLikelyMoneyValues(records: Record<string, unknown>[]) {
  const moneyKeys = ["value", "totalValue", "monthlyValue", "basePrice", "contractValue", "commission"];

  return records.reduce((total, record) => {
    const value = moneyKeys
      .map((key) => record[key])
      .find((candidate) => typeof candidate === "number" || typeof candidate === "string");
    return total + Number(value ?? 0);
  }, 0);
}
