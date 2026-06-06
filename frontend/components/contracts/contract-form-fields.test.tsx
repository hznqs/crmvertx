import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContractFormFields } from "@/components/contracts/contract-form-fields";
import type { Contract } from "@/lib/types/contracts";

const options = {
  clientOptions: [{ id: "client-1", label: "Cliente VX" }],
  serviceOptions: [
    { id: "service-1", label: "Landing Page", basePrice: 800, billingType: "MENSAL" as const },
    { id: "service-2", label: "Social Media", basePrice: 1200, billingType: "RECORRENTE" as const },
    { id: "service-3", label: "Setup SEO", basePrice: 1500, billingType: "UNICO" as const }
  ],
  projectOptions: []
};

describe("ContractFormFields", () => {
  it("calculates total from selected services, months, implementation fee and discount", async () => {
    const user = userEvent.setup();
    render(<ContractFormFields {...options} contract={contractFixture({ startDate: "2026-05-01", endDate: "2027-05-01" })} />);

    await user.click(screen.getByRole("button", { name: /Landing Page/i }));
    await user.click(screen.getByRole("button", { name: /Social Media/i }));
    await user.click(screen.getByRole("button", { name: /Setup SEO/i }));
    await replaceValue(user, "Taxa de Implementacao", "200000");
    await replaceValue(user, "Desconto", "50000");

    expect(screen.getByText(/R\$\s*27\.000/)).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*2\.000/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Duracao do contrato")).toHaveValue("12 meses / 365 dias");
  });

  it("blocks submission when no service is selected", () => {
    const { container } = render(<ContractFormFields {...options} />);

    expect(screen.getByText("Selecione pelo menos um servico ativo para o contrato.")).toBeInTheDocument();
    expect(container.querySelector('input[name="financialValidation"]')).toHaveValue("");
  });

  it("blocks submission when discount is greater than gross contract value", async () => {
    const user = userEvent.setup();
    const { container } = render(<ContractFormFields {...options} contract={contractFixture({ startDate: "2026-05-01", endDate: "2026-06-01" })} />);

    await user.click(screen.getByRole("button", { name: /Landing Page/i }));
    await replaceValue(user, "Desconto", "90000");

    expect(screen.getByText("Desconto nao pode ser maior que o valor bruto do contrato.")).toBeInTheDocument();
    expect(container.querySelector('input[name="financialValidation"]')).toHaveValue("");
  });

  it("keeps duration readonly and shows delivery prazo for one-time contracts", async () => {
    const user = userEvent.setup();
    render(<ContractFormFields {...options} contract={contractFixture({ startDate: "2026-06-02", endDate: "2026-06-19" })} />);

    await user.click(screen.getByRole("button", { name: /Setup SEO/i }));

    expect(screen.getByLabelText("Prazo de entrega")).toHaveValue("17 dias");
    expect(screen.getByText(/Servicos avulsos entram uma unica vez no total/)).toBeInTheDocument();
  });

  it("shows explicit operational project generation option only when contract has no linked project", () => {
    const { rerender } = render(<ContractFormFields {...options} />);

    expect(screen.getByText("Operacao do contrato")).toBeInTheDocument();
    expect(screen.getByLabelText("Gerar projeto ao salvar")).toBeInTheDocument();

    rerender(
      <ContractFormFields
        {...options}
        contract={contractFixture({ projectId: "project-1", serviceIds: ["service-1"], serviceId: "service-1" })}
      />
    );

    expect(screen.queryByLabelText("Gerar projeto ao salvar")).not.toBeInTheDocument();
    expect(screen.getByText("Projeto vinculado")).toBeInTheDocument();
  });
});

function contractFixture(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "contract-1",
    clientId: "client-1",
    serviceIds: [],
    serviceId: null,
    projectId: null,
    serviceItems: [],
    sellerName: null,
    plan: "Contrato VX",
    startDate: "2026-05-01",
    endDate: "2027-05-01",
    status: "ativo" as const,
    autoRenew: false,
    monthlyValue: 0,
    oneTimeServicesValue: 0,
    implementationFee: 0,
    discount: 0,
    totalValue: 0,
    durationMonths: 12,
    billingDueDay: 10,
    paymentMethod: null,
    notes: null,
    cancelledAt: null,
    endedAt: null,
    cancellationReason: null,
    churnReason: null,
    nonRenewalReason: null,
    recurring: false,
    mrrLost: 0,
    renewedFromContractId: null,
    renewedToContractId: null,
    active: true,
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
    ...overrides
  };
}

async function replaceValue(user: ReturnType<typeof userEvent.setup>, label: string, value: string) {
  const input = screen.getAllByLabelText(label).find((element) => element.getAttribute("type") !== "hidden");
  if (!input) {
    throw new Error(`Campo ${label} nao encontrado`);
  }
  await user.clear(input);
  await user.type(input, value);
}
