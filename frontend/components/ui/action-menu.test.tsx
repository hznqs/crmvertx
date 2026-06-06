import { fireEvent, render, screen } from "@testing-library/react";
import { Pencil, Trash2 } from "lucide-react";
import { ActionMenu } from "@/components/ui/action-menu";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn()
  })
}));

describe("ActionMenu", () => {
  it("renders only visible actions and executes normal callbacks", () => {
    const edit = jest.fn();

    render(
      <ActionMenu
        actions={[
          { label: "Editar", icon: Pencil, onSelect: edit },
          { label: "Oculta", onSelect: jest.fn(), hidden: true }
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Acoes" }));
    expect(screen.getByRole("menuitem", { name: /Editar/ })).toBeInTheDocument();
    expect(screen.queryByText("Oculta")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: /Editar/ }));
    expect(edit).toHaveBeenCalledTimes(1);
  });

  it("renders disabled actions with tooltip text", () => {
    render(
      <ActionMenu
        actions={[
          {
            label: "Excluir cliente",
            icon: Trash2,
            variant: "danger",
            disabled: true,
            tooltip: "Cliente possui contrato ativo.",
            onSelect: jest.fn()
          }
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Acoes" }));
    expect(screen.getByRole("menuitem", { name: /Excluir cliente/ })).toBeDisabled();
    expect(screen.getByText("Cliente possui contrato ativo.")).toBeInTheDocument();
  });

  it("opens confirmation for dangerous actions", () => {
    const archive = jest.fn();

    render(
      <ActionMenu
        actions={[
          {
            label: "Arquivar contrato",
            icon: Trash2,
            variant: "danger",
            separatorBefore: true,
            requiresConfirmation: true,
            confirmationTitle: "Arquivar contrato",
            confirmationDescription: "Essa acao preserva historico.",
            onSelect: archive
          }
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Acoes" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Arquivar contrato/ }));

    expect(screen.getByRole("dialog", { name: "Arquivar contrato" })).toBeInTheDocument();
    expect(screen.getByText("Essa acao preserva historico.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Arquivar contrato" }));
    expect(archive).toHaveBeenCalledTimes(1);
  });

  it("renders href actions as links", () => {
    render(
      <ActionMenu
        actions={[
          { label: "Ver contratos", href: "/contracts?clientId=123" }
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Acoes" }));
    expect(screen.getByRole("menuitem", { name: /Ver contratos/ })).toHaveAttribute("href", "/contracts?clientId=123");
  });
});
