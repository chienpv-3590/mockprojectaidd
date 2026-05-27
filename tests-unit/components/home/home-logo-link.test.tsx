import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeLogoLink } from "@/app/_components/home/home-logo-link";

// Default: on home page ("/")
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("<HomeLogoLink />", () => {
  it("renders a link to /", () => {
    render(<HomeLogoLink size="header" />);
    const link = screen.getByRole("link", {
      name: /Sun\* Annual Awards 2025 — Home/i,
    });
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders the logo image", () => {
    render(<HomeLogoLink size="header" />);
    expect(
      screen.getByAltText("Sun* Annual Awards 2025")
    ).toBeInTheDocument();
  });

  it("calls window.scrollTo when clicked while already on /", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(<HomeLogoLink size="header" />);
    const link = screen.getByRole("link", {
      name: /Sun\* Annual Awards 2025 — Home/i,
    });
    await userEvent.click(link);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    vi.unstubAllGlobals();
  });

  it("applies header size class to the image", () => {
    render(<HomeLogoLink size="header" />);
    const img = screen.getByAltText("Sun* Annual Awards 2025");
    expect(img).toHaveClass("h-12");
  });

  it("applies footer size class to the image", () => {
    render(<HomeLogoLink size="footer" />);
    const img = screen.getByAltText("Sun* Annual Awards 2025");
    expect(img).toHaveClass("h-10");
  });
});
