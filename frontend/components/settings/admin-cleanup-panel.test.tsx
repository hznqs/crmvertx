import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn()
  })
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn()
}));

jest.mock("@/lib/admin/cleanup-actions", () => ({
  cleanupCrmAction: jest.fn()
}), { virtual: true });

const { AdminCleanupPanel } = jest.requireActual("./admin-cleanup-panel") as typeof import("./admin-cleanup-panel");

describe("AdminCleanupPanel", () => {
  it("requires textual confirmation before enabling cleanup", () => {
    render(<AdminCleanupPanel />);

    const button = screen.getByRole("button", { name: /Executar limpeza/ });
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("LIMPAR_DADOS_DO_CRM"), {
      target: { value: "LIMPAR_DADOS_DO_CRM" }
    });

    expect(button).toBeEnabled();
  });

  it("shows available safe cleanup modes and backup warning", () => {
    render(<AdminCleanupPanel />);

    expect(screen.getAllByText("Limpar dados operacionais").length).toBeGreaterThan(0);
    expect(screen.getByText("Limpar negocio completo")).toBeInTheDocument();
    expect(screen.getByText(/Backup recomendado/)).toBeInTheDocument();
    expect(screen.queryByText(/Reset demo/i)).not.toBeInTheDocument();
  });
});
