import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/tests-unit/_helpers/render-with-i18n";
import userEvent from "@testing-library/user-event";
import { NavLinks } from "@/app/_components/home/nav-links";
import viDict from "@/lib/i18n/dictionaries/vi.json";

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
      screen.getByRole("link", { name: viDict.nav.about })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: viDict.nav.awardsInfo })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: viDict.nav.kudos })
    ).toBeInTheDocument();
  });

  it("marks the active link with aria-current=page on /", () => {
    mockPathname.value = "/";
    render(<NavLinks />);
    const activeLink = screen.getByRole("link", { name: viDict.nav.about });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("marks the active link with aria-current=page on /he-thong-giai", () => {
    mockPathname.value = "/he-thong-giai";
    render(<NavLinks />);
    const activeLink = screen.getByRole("link", { name: viDict.nav.awardsInfo });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("marks the active link with aria-current=page on /sun-kudos", () => {
    mockPathname.value = "/sun-kudos";
    render(<NavLinks />);
    const activeLink = screen.getByRole("link", { name: viDict.nav.kudos });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("does NOT set aria-current on inactive links", () => {
    mockPathname.value = "/";
    render(<NavLinks />);
    const awardsLink = screen.getByRole("link", { name: viDict.nav.awardsInfo });
    expect(awardsLink).not.toHaveAttribute("aria-current");
    const kudosLink = screen.getByRole("link", { name: viDict.nav.kudos });
    expect(kudosLink).not.toHaveAttribute("aria-current");
  });

  it("scrolls to top when clicking the already-active link", async () => {
    mockPathname.value = "/";
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(<NavLinks />);
    await userEvent.click(screen.getByRole("link", { name: viDict.nav.about }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    vi.unstubAllGlobals();
  });

  it("renders the nav inside a Main navigation landmark", () => {
    mockPathname.value = "/";
    render(<NavLinks />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });
});
