import { render, screen } from "@testing-library/react";
import { GoalMetrics } from "@/components/goals/goal-metrics";
import { goalTypeLabels } from "@/lib/goals/labels";
import type { Goal } from "@/lib/types/goals";

describe("GoalMetrics", () => {
  it("supports every frontend/backend goal type and handles zero values", () => {
    expect(Object.keys(goalTypeLabels)).toEqual([
      "FATURAMENTO",
      "VENDAS",
      "CLIENTES",
      "REUNIOES",
      "ENTREGAS",
      "LUCRO",
      "LEADS",
      "TAREFAS",
      "PROJETOS",
      "COMISSAO"
    ]);

    const goals: Goal[] = [
      {
        id: "1",
        name: "Faturamento mensal",
        type: "FATURAMENTO",
        target: 0,
        actual: 0,
        progress: 0,
        date: "2026-05-01",
        periodStart: null,
        periodEnd: null,
        responsible: null,
        status: "EM_ANDAMENTO",
        active: true,
        createdAt: "2026-05-01T00:00:00Z",
        updatedAt: "2026-05-01T00:00:00Z"
      }
    ];

    render(<GoalMetrics goals={goals} totalElements={1} />);

    expect(screen.getByText("Metas no filtro")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
