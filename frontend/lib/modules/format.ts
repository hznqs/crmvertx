import { formatCurrency, formatDate } from "@/lib/formatters";
import type { ModuleColumn } from "@/lib/modules/registry";

export function formatModuleValue(
  record: Record<string, unknown>,
  column: ModuleColumn
) {
  const value = record[column.key];

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (column.format === "currency") {
    return formatCurrency(value as string | number);
  }

  if (column.format === "date" || column.format === "datetime") {
    return formatDate(String(value));
  }

  if (column.format === "boolean") {
    return value ? "Sim" : "Nao";
  }

  return String(value);
}
