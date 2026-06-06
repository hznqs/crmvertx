import { render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

type Row = {
  name: string;
  status: string;
};

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "status", header: "Status" }
];

describe("DataTable", () => {
  it("renders rows and empty state", () => {
    const { rerender } = render(
      <DataTable
        data={[{ name: "VX Midia", status: "Ativo" }]}
        columns={columns}
        emptyLabel="Nada encontrado"
      />
    );

    expect(screen.getByText("VX Midia")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();

    rerender(<DataTable data={[]} columns={columns} emptyLabel="Nada encontrado" />);

    expect(screen.getByText("Nada encontrado")).toBeInTheDocument();
  });
});
