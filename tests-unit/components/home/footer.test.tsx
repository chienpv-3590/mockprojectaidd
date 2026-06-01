import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/tests-unit/_helpers/render-with-i18n";
import { Footer } from "@/app/_components/home/footer";
import viDict from "@/lib/i18n/dictionaries/vi.json";

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
      screen.getByRole("link", { name: viDict.nav.about })
    ).toBeInTheDocument();
  });

  it("renders the 'Awards Information' nav link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: viDict.nav.awardsInfo })
    ).toBeInTheDocument();
  });

  it("renders the 'Sun* Kudos' nav link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: viDict.nav.kudos })
    ).toBeInTheDocument();
  });

  it("renders the 'Tiêu chuẩn chung' footer-only link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: viDict.nav.standards })
    ).toBeInTheDocument();
  });

  it("marks the active home link with aria-current=page when on /", () => {
    render(<Footer />);
    const homeLink = screen.getByRole("link", { name: viDict.nav.about });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});
