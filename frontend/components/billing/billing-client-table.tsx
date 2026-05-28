"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/formatters";
import type { BillingClient } from "@/lib/types/billing";

const columns: ColumnDef<BillingClient>[] = [
  {
    accessorKey: "clientName",
    header: "Cliente",
    cell: ({ row }) => <span className="font-semibold text-white">{row.original.clientName}</span>
  },
  {
    accessorKey: "monthlyValue",
    header: "Mensalidade",
    cell: ({ row }) => formatCurrency(row.original.monthlyValue)
  },
  {
    accessorKey: "months",
    header: "Meses"
  },
  {
    accessorKey: "totalValue",
    header: "Total",
    cell: ({ row }) => <span className="font-bold text-emerald-100">{formatCurrency(row.original.totalValue)}</span>
  }
];

export function BillingClientTable({ clients }: Readonly<{ clients: BillingClient[] }>) {
  return (
    <DataTable
      data={clients}
      columns={columns}
      emptyLabel="Nenhum contrato ativo encontrado."
    />
  );
}
