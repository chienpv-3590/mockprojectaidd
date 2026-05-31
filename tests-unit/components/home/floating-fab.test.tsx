import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/lib/i18n/locale-context";
import viDict from "@/lib/i18n/dictionaries/vi.json";
import { FloatingFab } from "@/app/_components/home/floating-fab";

/**
 * Interactive FAB tests (MoMorph `_hphd32jN2` collapsed + `Sv7DFwBw1h`
 * expanded). Collapsed renders one trigger pill; expanded renders three
 * buttons (Thể lệ, Viết KUDOS, close X). Callbacks fire on the action
 * buttons and the FAB always collapses after.
 */

function renderFab() {
  const onOpenRules = vi.fn();
  const onOpenCompose = vi.fn();
  const result = render(
    <I18nProvider value={{ locale: "vi", dict: viDict }}>
      <FloatingFab onOpenRules={onOpenRules} onOpenCompose={onOpenCompose} />
    </I18nProvider>
  );
  return { onOpenRules, onOpenCompose, ...result };
}

describe("<FloatingFab />", () => {
  it("renders collapsed by default with a single trigger button", () => {
    renderFab();
    const trigger = screen.getByRole("button", { name: "Mở menu nhanh" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thể lệ" })).toBeNull();
  });

  it("expands to reveal Thể lệ + Viết KUDOS + close on trigger click", async () => {
    const user = userEvent.setup();
    renderFab();
    await user.click(screen.getByRole("button", { name: "Mở menu nhanh" }));

    expect(screen.getByRole("button", { name: "Thể lệ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Viết KUDOS" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đóng menu" })).toBeInTheDocument();
  });

  it("clicking Thể lệ invokes onOpenRules and collapses", async () => {
    const user = userEvent.setup();
    const { onOpenRules } = renderFab();
    await user.click(screen.getByRole("button", { name: "Mở menu nhanh" }));
    await user.click(screen.getByRole("button", { name: "Thể lệ" }));

    expect(onOpenRules).toHaveBeenCalledTimes(1);
    // Collapsed again — only the trigger remains.
    expect(screen.getByRole("button", { name: "Mở menu nhanh" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thể lệ" })).toBeNull();
  });

  it("clicking Viết KUDOS invokes onOpenCompose and collapses", async () => {
    const user = userEvent.setup();
    const { onOpenCompose, onOpenRules } = renderFab();
    await user.click(screen.getByRole("button", { name: "Mở menu nhanh" }));
    await user.click(screen.getByRole("button", { name: "Viết KUDOS" }));

    expect(onOpenCompose).toHaveBeenCalledTimes(1);
    expect(onOpenRules).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Mở menu nhanh" })).toBeInTheDocument();
  });

  it("clicking the close X collapses without invoking either callback", async () => {
    const user = userEvent.setup();
    const { onOpenRules, onOpenCompose } = renderFab();
    await user.click(screen.getByRole("button", { name: "Mở menu nhanh" }));
    await user.click(screen.getByRole("button", { name: "Đóng menu" }));

    expect(onOpenRules).not.toHaveBeenCalled();
    expect(onOpenCompose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Mở menu nhanh" })).toBeInTheDocument();
  });

  it("Escape collapses when expanded", async () => {
    const user = userEvent.setup();
    renderFab();
    await user.click(screen.getByRole("button", { name: "Mở menu nhanh" }));
    expect(screen.getByRole("button", { name: "Thể lệ" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Thể lệ" })).toBeNull();
    expect(screen.getByRole("button", { name: "Mở menu nhanh" })).toBeInTheDocument();
  });
});
