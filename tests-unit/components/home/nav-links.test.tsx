import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavLinks } from "@/app/_components/home/nav-links";

// Mutable so individual tests can override via vi.mock factory
const mockPathname = { value: "/" };

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.value,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("<NavLinks />", () => {
  it("renders all three nav links", () => {
    mockPathname.value = "/other";
    render(<NavLinks />);
    expect(
      screen.getByRole("link", { name: "About SAA 2025" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Awards Information" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sun* Kudos" })
    ).toBeInTheDocument();
  });

  it("marks the active link with aria-current=page on /", () => {
    mockPathname.value = "/";
    render(<NavLinks />);
    const activeLink = screen.getByRole("link", { name: "About SAA 2025" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("marks the active link with aria-current=page on /he-thong-giai", () => {
    mockPathname.value = "/he-thong-giai";
    render(<NavLinks />);
    const activeLink = screen.getByRole("link", { name: "Awards Information" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("marks the active link with aria-current=page on /sun-kudos", () => {
    mockPathname.value = "/sun-kudos";
    render(<NavLinks />);
    const activeLink = screen.getByRole("link", { name: "Sun* Kudos" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("does NOT set aria-current on inactive links", () => {
    mockPathname.value = "/";
    render(<NavLinks />);
    const awardsLink = screen.getByRole("link", { name: "Awards Information" });
    expect(awardsLink).not.toHaveAttribute("aria-current");
    const kudosLink = screen.getByRole("link", { name: "Sun* Kudos" });
    expect(kudosLink).not.toHaveAttribute("aria-current");
  });

  it("scrolls to top when clicking the already-active link", async () => {
    mockPathname.value = "/";
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(<NavLinks />);
    await userEvent.click(screen.getByRole("link", { name: "About SAA 2025" }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    vi.unstubAllGlobals();
  });

  it("renders the nav inside a Main navigation landmark", () => {
    mockPathname.value = "/";
    render(<NavLinks />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });
});
