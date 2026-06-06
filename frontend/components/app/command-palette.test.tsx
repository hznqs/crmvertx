import { render, screen } from "@testing-library/react";
import { CommandPalette } from "@/components/app/command-palette";
import { useUiStore } from "@/lib/store/ui-store";

jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>
  }
}));

describe("CommandPalette", () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    useUiStore.setState({ commandOpen: true });
  });

  afterEach(() => {
    useUiStore.setState({ commandOpen: false });
  });

  it("shows allowed current-scope routes and hides advanced routes", () => {
    render(<CommandPalette role="ADMIN" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Clientes")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
    expect(screen.queryByText("Activity Feed")).not.toBeInTheDocument();
    expect(screen.queryByText("Integrações")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument();
  });
});
