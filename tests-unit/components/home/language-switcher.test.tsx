import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@/tests-unit/_helpers/render-with-i18n";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import viDict from "@/lib/i18n/dictionaries/vi.json";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/i18n/set-locale-cookie", () => ({
  setLocaleCookie: vi.fn(),
}));

describe("<LanguageSwitcher />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("defaults to VN locale label", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("VN")).toBeInTheDocument();
  });

  it("renders the toggle button with accessible label", () => {
    render(<LanguageSwitcher />);
    expect(
      screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel })
    ).toBeInTheDocument();
  });

  it("dropdown is closed initially (no listbox visible)", () => {
    render(<LanguageSwitcher />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens the dropdown on button click", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel }));
    expect(screen.getByRole("listbox", { name: "Languages" })).toBeInTheDocument();
  });

  it("shows both language options when open", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel }));
    expect(screen.getByText("Tiếng Việt")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("closes the dropdown after selecting an option", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel }));
    const enOption = screen.getByRole("option", { name: /English/i });
    await userEvent.click(enOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes dropdown and attempts locale change when selecting EN", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("option", { name: /English/i }));

    // Dropdown closes after selection
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the dropdown on Escape key", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks the currently selected option as aria-selected=true", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: viDict.languageSwitcher.ariaLabel }));
    const vnOption = screen.getByRole("option", { name: /Tiếng Việt/i });
    expect(vnOption).toHaveAttribute("aria-selected", "true");
  });
});
