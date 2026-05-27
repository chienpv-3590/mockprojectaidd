import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";

describe("<LanguageSwitcher />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to VN locale label", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("VN")).toBeInTheDocument();
  });

  it("renders the toggle button with accessible label", () => {
    render(<LanguageSwitcher />);
    expect(
      screen.getByRole("button", { name: "Change language" })
    ).toBeInTheDocument();
  });

  it("dropdown is closed initially (no listbox visible)", () => {
    render(<LanguageSwitcher />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens the dropdown on button click", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    expect(screen.getByRole("listbox", { name: "Languages" })).toBeInTheDocument();
  });

  it("shows both language options when open", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    expect(screen.getByText("Tiếng Việt")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("closes the dropdown after selecting an option", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    const enOption = screen.getByRole("option", { name: /English/i });
    await userEvent.click(enOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("updates the displayed locale code after selecting EN", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    await userEvent.click(screen.getByRole("option", { name: /English/i }));
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("closes the dropdown on Escape key", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks the currently selected option as aria-selected=true", async () => {
    render(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole("button", { name: "Change language" }));
    const vnOption = screen.getByRole("option", { name: /Tiếng Việt/i });
    expect(vnOption).toHaveAttribute("aria-selected", "true");
  });
});
