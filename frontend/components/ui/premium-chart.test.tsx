import { render, screen } from "@testing-library/react";
import { ChartCard, ChartEmptyState, PremiumChartTooltip } from "@/components/ui/premium-chart";

describe("premium chart components", () => {
  it("renders chart card metadata and metric", () => {
    render(
      <ChartCard eyebrow="Receita" title="Faturamento diario" subtitle="Evolucao do periodo" metric="R$ 12.000" badge="30 dias">
        <div>Grafico</div>
      </ChartCard>
    );

    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Faturamento diario" })).toBeInTheDocument();
    expect(screen.getByText("R$ 12.000")).toBeInTheDocument();
    expect(screen.getByText("30 dias")).toBeInTheDocument();
  });

  it("renders empty state copy", () => {
    render(<ChartEmptyState title="Sem dados" description="Cadastre informacoes para visualizar." />);

    expect(screen.getByText("Sem dados")).toBeInTheDocument();
    expect(screen.getByText("Cadastre informacoes para visualizar.")).toBeInTheDocument();
  });

  it("renders formatted tooltip values when active", () => {
    render(
      <PremiumChartTooltip
        active
        label="Hoje"
        payload={[{ name: "Receita", value: 6500, color: "#ea59dc" }]}
        valueFormatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`}
      />
    );

    expect(screen.getByText("Hoje")).toBeInTheDocument();
    expect(screen.getByText("Receita")).toBeInTheDocument();
    expect(screen.getByText("R$ 6.500")).toBeInTheDocument();
  });
});
