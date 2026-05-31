import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/lib/i18n/locale-context";
import viDict from "@/lib/i18n/dictionaries/vi.json";
import { RulesDrawer } from "@/app/_components/rules/rules-drawer";

function renderDrawer(open: boolean) {
  const onClose = vi.fn();
  const onWriteKudos = vi.fn();
  const result = render(
    <I18nProvider value={{ locale: "vi", dict: viDict }}>
      <RulesDrawer open={open} onClose={onClose} onWriteKudos={onWriteKudos} />
    </I18nProvider>
  );
  return { onClose, onWriteKudos, ...result };
}

describe("<RulesDrawer />", () => {
  it("renders nothing when open=false", () => {
    renderDrawer(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders as a modal dialog with the Thể lệ title when open=true", () => {
    renderDrawer(true);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "rules-drawer-title");
    expect(
      screen.getByRole("heading", { level: 2, name: viDict.rules.title })
    ).toBeInTheDocument();
  });

  it("Escape key invokes onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer(true);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("footer Đóng button invokes onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer(true);
    // The footer "Đóng" button is the only one with that accessible name
    // that is NOT the backdrop (backdrop has tabIndex=-1 but same label).
    // Use getAllByRole and pick the one with no tabindex=-1.
    const buttons = screen
      .getAllByRole("button", { name: viDict.rules.close })
      .filter((b) => b.getAttribute("tabindex") !== "-1");
    expect(buttons).toHaveLength(1);
    await user.click(buttons[0]!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("footer Viết KUDOS button invokes onWriteKudos", async () => {
    const user = userEvent.setup();
    const { onWriteKudos, onClose } = renderDrawer(true);
    await user.click(
      screen.getByRole("button", { name: viDict.fab.writeKudos })
    );
    expect(onWriteKudos).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("locks body scroll while open and restores it on unmount", () => {
    const original = document.body.style.overflow;
    const { unmount } = renderDrawer(true);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe(original);
  });
});
