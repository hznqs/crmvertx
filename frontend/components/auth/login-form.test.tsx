import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/components/auth/login-form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    refresh: jest.fn()
  })
}));

describe("LoginForm", () => {
  it("uses controlled internal access copy instead of a fake public registration flow", () => {
    render(<LoginForm redirectPath="/dashboard" />);

    expect(screen.getByText("Recuperação via administrador")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver instrucoes" })).toHaveAttribute("href", "/register");
    expect(screen.queryByText("Registrar")).not.toBeInTheDocument();
  });
});
