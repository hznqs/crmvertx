import { render, screen } from "@testing-library/react";
import { BillingClientTable } from "@/components/billing/billing-client-table";

describe("BillingClientTable", () => {
  it("renders financial summary rows and handles missing client labels", () => {
    render(
      <BillingClientTable
        clients={[
          {
            clientId: "missing-client",
            clientName: "Cliente Removido",
            monthlyValue: 500,
            months: 12,
            totalValue: 6500
          }
        ]}
      />
    );

    expect(screen.getByText("Cliente Removido")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*500/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*6\.500/)).toBeInTheDocument();
  });
});
