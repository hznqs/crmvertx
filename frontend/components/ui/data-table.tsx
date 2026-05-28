"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  emptyLabel: string;
};

export function DataTable<TData>({ data, columns, emptyLabel }: DataTableProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // TanStack Table exposes imperative helpers; React Compiler should not memoize this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });
  const rows = table.getRowModel().rows;
  const shouldVirtualize = rows.length > 80;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 58,
    overscan: 12
  });
  const visibleRows = shouldVirtualize
    ? virtualizer.getVirtualItems().map((virtualRow) => ({
        row: rows[virtualRow.index],
        virtualRow
      }))
    : rows.map((row, index) => ({
        row,
        virtualRow: { key: row.id, start: index * 58, size: 58 }
      }));

  return (
    <div className="crm-table-shell">
      <div ref={scrollContainerRef} className={cn("calendar-scrollbar overflow-x-auto", shouldVirtualize && "max-h-[620px] overflow-y-auto")}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="crm-table-head">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-bold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className="relative divide-y divide-line"
            style={shouldVirtualize ? { height: `${virtualizer.getTotalSize()}px` } : undefined}
          >
            {rows.length ? (
              visibleRows.map(({ row, virtualRow }) => (
                <tr
                  key={virtualRow.key}
                  className="text-zinc-200 transition duration-premium ease-premium hover:bg-brand-500/10"
                  style={
                    shouldVirtualize
                      ? {
                          position: "absolute",
                          transform: `translateY(${virtualRow.start}px)`,
                          width: "100%"
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cn("px-4 py-3 align-middle")}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted">
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
