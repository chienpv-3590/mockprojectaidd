import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { SpotlightTooltip, formatRelative } from "@/app/_components/sun-kudos/spotlight-tooltip";
import type { TooltipState } from "@/app/_components/sun-kudos/spotlight-tooltip";

function makeRef() {
  return createRef<HTMLDivElement>();
}

function hiddenState(over: Partial<TooltipState> = {}): TooltipState {
  return {
    visible: false,
    x: 0,
    y: 0,
    name: "",
    lastReceivedAt: "",
    ...over,
  };
}

function visibleState(over: Partial<TooltipState> = {}): TooltipState {
  return {
    visible: true,
    x: 100,
    y: 80,
    name: "Nguyen Van A",
    lastReceivedAt: "",
    ...over,
  };
}

// Fixed "now" for deterministic relative-time assertions.
// 2026-05-26T10:00:00Z
const FIXED_NOW = new Date("2026-05-26T10:00:00Z").getTime();

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// formatRelative unit tests
// ---------------------------------------------------------------------------
describe("formatRelative()", () => {
  it("returns empty string for empty input", () => {
    expect(formatRelative("")).toBe("");
  });

  it("returns 'vừa xong' for timestamps < 60s ago", () => {
    const iso = new Date(FIXED_NOW - 30_000).toISOString();
    expect(formatRelative(iso)).toBe("vừa xong");
  });

  it("returns 'X phút trước' for timestamps < 1 hour ago", () => {
    const iso = new Date(FIXED_NOW - 5 * 60_000).toISOString();
    expect(formatRelative(iso)).toBe("5 phút trước");
  });

  it("returns 'X giờ trước' for timestamps < 24 hours ago", () => {
    const iso = new Date(FIXED_NOW - 3 * 3600_000).toISOString();
    expect(formatRelative(iso)).toBe("3 giờ trước");
  });

  it("returns 'X ngày trước' for timestamps < 30 days ago", () => {
    const iso = new Date(FIXED_NOW - 11 * 86_400_000).toISOString();
    expect(formatRelative(iso)).toBe("11 ngày trước");
  });

  it("falls back to HH:mm - DD/MM/YYYY for timestamps >= 30 days ago", () => {
    // 2026-04-01T08:30:00 is > 30 days before 2026-05-26
    expect(formatRelative("2026-04-01T08:30:00")).toMatch(/08:30 - 01\/04\/2026/);
  });
});

// ---------------------------------------------------------------------------
// SpotlightTooltip component tests
// ---------------------------------------------------------------------------
describe("<SpotlightTooltip />", () => {
  it("renders nothing when visible=false", () => {
    const { container } = render(
      <SpotlightTooltip state={hiddenState()} containerRef={makeRef()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders user name when visible=true", () => {
    render(
      <SpotlightTooltip
        state={visibleState({ name: "Tran Thi B" })}
        containerRef={makeRef()}
      />
    );
    expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
  });

  it("does not render timestamp paragraph when lastReceivedAt is empty", () => {
    render(
      <SpotlightTooltip
        state={visibleState({ lastReceivedAt: "" })}
        containerRef={makeRef()}
      />
    );
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    // No second paragraph for relative time
    const paragraphs = screen.getAllByRole("paragraph");
    expect(paragraphs).toHaveLength(1);
  });

  it("renders 'Đã nhận Kudos lúc X phút trước' for a recent timestamp", () => {
    // 5 minutes before FIXED_NOW
    const recentIso = new Date(FIXED_NOW - 5 * 60_000).toISOString();
    render(
      <SpotlightTooltip
        state={visibleState({ name: "Le Van C", lastReceivedAt: recentIso })}
        containerRef={makeRef()}
      />
    );
    expect(
      screen.getByText("Đã nhận Kudos lúc 5 phút trước")
    ).toBeInTheDocument();
  });

  it("renders 'Đã nhận Kudos lúc X ngày trước' for an older timestamp", () => {
    // 11 days before FIXED_NOW → "11 ngày trước"
    const olderIso = new Date(FIXED_NOW - 11 * 86_400_000).toISOString();
    render(
      <SpotlightTooltip
        state={visibleState({ name: "Pham Van D", lastReceivedAt: olderIso })}
        containerRef={makeRef()}
      />
    );
    expect(
      screen.getByText("Đã nhận Kudos lúc 11 ngày trước")
    ).toBeInTheDocument();
  });

  it("renders both name and relative time when both are supplied", () => {
    const recentIso = new Date(FIXED_NOW - 2 * 3600_000).toISOString();
    render(
      <SpotlightTooltip
        state={visibleState({ name: "Pham Van D", lastReceivedAt: recentIso })}
        containerRef={makeRef()}
      />
    );
    expect(screen.getByText("Pham Van D")).toBeInTheDocument();
    expect(
      screen.getByText("Đã nhận Kudos lúc 2 giờ trước")
    ).toBeInTheDocument();
  });

  it("positions tooltip using left/top from state.x and state.y (initial render before layout effect)", () => {
    const { container } = render(
      <SpotlightTooltip
        state={visibleState({ x: 150, y: 60 })}
        containerRef={makeRef()}
      />
    );
    // Before layout effect fires (jsdom getBoundingClientRect returns zeros),
    // initial adjustedPos uses the useState initializer which is state.x/state.y.
    const tip = container.firstChild as HTMLElement;
    expect(tip).toBeDefined();
    expect(tip.style.position).toBe("");
    // The component uses className "absolute" for positioning; left/top come from style.
    expect(tip.style.left).toBe("150px");
    expect(tip.style.top).toBe("60px");
  });

  it("applies pointer-events-none and z-50 classes", () => {
    const { container } = render(
      <SpotlightTooltip
        state={visibleState()}
        containerRef={makeRef()}
      />
    );
    const tip = container.firstChild as HTMLElement;
    expect(tip.className).toContain("pointer-events-none");
    expect(tip.className).toContain("z-50");
  });
});
