import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/app/_components/home/footer";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("<Footer />", () => {
  it("renders copyright text", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Bản quyền thuộc về Sun\* © 2025/)
    ).toBeInTheDocument();
  });

  it("renders the footer nav landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
  });

  it("renders the 'About SAA 2025' nav link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "About SAA 2025" })
    ).toBeInTheDocument();
  });

  it("renders the 'Awards Information' nav link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "Awards Information" })
    ).toBeInTheDocument();
  });

  it("renders the 'Sun* Kudos' nav link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "Sun* Kudos" })
    ).toBeInTheDocument();
  });

  it("renders the 'Tiêu chuẩn chung' footer-only link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "Tiêu chuẩn chung" })
    ).toBeInTheDocument();
  });

  it("marks the active home link with aria-current=page when on /", () => {
    render(<Footer />);
    const homeLink = screen.getByRole("link", { name: "About SAA 2025" });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
