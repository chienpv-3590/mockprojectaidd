import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/tests-unit/_helpers/render-with-i18n";
import { Header } from "@/app/_components/home/header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("<Header />", () => {
  it("renders the header landmark", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders the logo link", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: /Sun\* Annual Awards 2025 — Home/i })
    ).toBeInTheDocument();
  });

  it("renders the main navigation", () => {
    render(<Header />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });

  it("renders languageSlot content when provided", () => {
    render(<Header languageSlot={<button type="button">LANG</button>} />);
    expect(screen.getByRole("button", { name: "LANG" })).toBeInTheDocument();
  });

  it("renders notificationSlot content when provided", () => {
    render(<Header notificationSlot={<button type="button">BELL</button>} />);
    expect(screen.getByRole("button", { name: "BELL" })).toBeInTheDocument();
  });

  it("renders userSlot content when provided", () => {
    render(<Header userSlot={<span data-testid="user-slot">USER</span>} />);
    expect(screen.getByTestId("user-slot")).toBeInTheDocument();
  });

  it("renders all three slots together", () => {
    render(
      <Header
        languageSlot={<span data-testid="lang">L</span>}
        notificationSlot={<span data-testid="notif">N</span>}
        userSlot={<span data-testid="user">U</span>}
      />
    );
    expect(screen.getByTestId("lang")).toBeInTheDocument();
    expect(screen.getByTestId("notif")).toBeInTheDocument();
    expect(screen.getByTestId("user")).toBeInTheDocument();
  });
});
