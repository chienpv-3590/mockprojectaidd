/**
 * Characterization (regression) tests for
 * app/login/_components/language-switcher.tsx — LanguageSwitcher.
 *
 * Current behavior (as coded):
 *  - Defaults to "VN" locale — shows "VN" code in the trigger.
 *  - Clicking the trigger toggles the dropdown open/closed.
 *  - Selecting a locale closes the dropdown and updates the displayed code.
 *  - i18n wiring is explicitly deferred in source; selection is VISUAL ONLY —
 *    no localStorage reads or writes occur. Tests match this current behavior.
 *  - Outside click (document click not on ref) closes the open menu.
 *  - Escape key closes the open menu.
 *  - aria-expanded reflects open/closed state.
 *
 * NOTE: localStorage persistence is NOT tested because the source code
 * explicitly says "i18n wiring deferred — selection is visual only for now."
 * If persistence is added later, add a test at that point.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/app/login/_components/language-switcher";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSwitcher() {
  return render(<LanguageSwitcher />);
}

/** Returns the trigger button (aria-label="Change language"). */
function getTrigger() {
  return screen.getByRole("button", { name: /change language/i });
}

/** Opens the dropdown. Returns the listbox element. */
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getTrigger());
  return screen.getByRole("listbox", { name: /languages/i });
}

// ---------------------------------------------------------------------------
// Default render
// ---------------------------------------------------------------------------

describe("<LanguageSwitcher /> — default render", () => {
  it("renders a trigger button with aria-label='Change language'", () => {
    renderSwitcher();
    expect(getTrigger()).toBeInTheDocument();
  });

  it("displays 'VN' as the default selected locale code", () => {
    renderSwitcher();
    // The trigger shows the current locale code as a <span>
    expect(within(getTrigger()).getByText("VN")).toBeInTheDocument();
  });

  it("trigger has aria-haspopup='listbox'", () => {
    renderSwitcher();
    expect(getTrigger()).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("trigger has aria-expanded='false' when closed", () => {
    renderSwitcher();
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("does NOT render the dropdown listbox initially", () => {
    renderSwitcher();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Open / close via trigger click
// ---------------------------------------------------------------------------

describe("<LanguageSwitcher /> — open/close via trigger", () => {
  it("opens the listbox when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.click(getTrigger());
    expect(screen.getByRole("listbox", { name: /languages/i })).toBeInTheDocument();
  });

  it("sets aria-expanded='true' on the trigger when open", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.click(getTrigger());
    expect(getTrigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the listbox when trigger is clicked again", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.click(getTrigger()); // open
    await user.click(getTrigger()); // close
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("sets aria-expanded='false' again after closing", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.click(getTrigger());
    await user.click(getTrigger());
    expect(getTrigger()).toHaveAttribute("aria-expanded", "false");
  });
});

// ---------------------------------------------------------------------------
// Listbox contents
// ---------------------------------------------------------------------------

describe("<LanguageSwitcher /> — listbox contents", () => {
  it("renders two locale options: Tiếng Việt and English", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    const listbox = await openMenu(user);
    expect(within(listbox).getByText("Tiếng Việt")).toBeInTheDocument();
    expect(within(listbox).getByText("English")).toBeInTheDocument();
  });

  it("marks VN option as aria-selected='true' by default", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    const options = screen.getAllByRole("option");
    const vn = options.find((o) => o.getAttribute("aria-selected") === "true");
    expect(vn).toBeInTheDocument();
    expect(within(vn!).getByText("VN")).toBeInTheDocument();
  });

  it("marks EN option as aria-selected='false' by default", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    const options = screen.getAllByRole("option");
    const en = options.find((opt) => within(opt).queryByText("EN"));
    expect(en).toHaveAttribute("aria-selected", "false");
  });
});

// ---------------------------------------------------------------------------
// Locale selection
// ---------------------------------------------------------------------------

describe("<LanguageSwitcher /> — locale selection", () => {
  it("closes the dropdown after selecting a locale", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    const [, enOption] = screen.getAllByRole("option");
    await user.click(enOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("updates the trigger to show 'EN' after selecting English", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    const options = screen.getAllByRole("option");
    const enOption = options.find((o) => within(o).queryByText("EN"))!;
    await user.click(enOption);
    expect(within(getTrigger()).getByText("EN")).toBeInTheDocument();
  });

  it("selecting VN (already selected) still closes and keeps VN", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    const options = screen.getAllByRole("option");
    const vnOption = options.find((o) => within(o).queryByText("VN"))!;
    await user.click(vnOption);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(within(getTrigger()).getByText("VN")).toBeInTheDocument();
  });

  it("after switching to EN, aria-selected is true for EN and false for VN", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    const enOption = screen.getAllByRole("option").find((o) => within(o).queryByText("EN"))!;
    await user.click(enOption);

    // Reopen to check aria-selected
    await openMenu(user);
    const options = screen.getAllByRole("option");
    const nowVN = options.find((o) => within(o).queryByText("VN"))!;
    const nowEN = options.find((o) => within(o).queryByText("EN"))!;
    expect(nowEN).toHaveAttribute("aria-selected", "true");
    expect(nowVN).toHaveAttribute("aria-selected", "false");
  });

  it("does NOT read or write localStorage (selection is visual-only)", () => {
    // The source code explicitly defers i18n wiring. Verify localStorage is untouched.
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    renderSwitcher();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Outside click closes menu
// ---------------------------------------------------------------------------

describe("<LanguageSwitcher /> — outside click closes menu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("closes the menu when clicking outside the component", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Click on the document body — outside the component
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Escape key closes menu
// ---------------------------------------------------------------------------

describe("<LanguageSwitcher /> — Escape key closes menu", () => {
  it("closes the menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await openMenu(user);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("Escape has no effect when menu is already closed", () => {
    renderSwitcher();
    // Should not throw
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
