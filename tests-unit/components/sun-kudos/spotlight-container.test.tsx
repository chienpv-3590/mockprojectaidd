import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SpotlightNode } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// d3-cloud mock — synchronously calls "end" with echoed words so the SVG
// renders immediately without waiting on a real async layout pass.
// ---------------------------------------------------------------------------
vi.mock("d3-cloud", () => {
  const cloud = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers: Record<string, (...args: any[]) => void> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let _words: any[] = [];

    const api = {
      size: () => api,
      words: (w: unknown[]) => {
        _words = w as typeof _words;
        return api;
      },
      padding: () => api,
      rotate: () => api,
      font: () => api,
      fontSize: () => api,
      spiral: () => api,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (event: string, cb: (...args: any[]) => void) => {
        handlers[event] = cb;
        return api;
      },
      start: () => {
        const placed = _words.map((w, i) => ({
          ...w,
          x: i * 10,
          y: i * 10,
          rotate: 0,
        }));
        handlers["end"]?.(placed);
        return api;
      },
    };
    return api;
  };
  return { default: cloud };
});

// ---------------------------------------------------------------------------
// react-zoom-pan-pinch mock — render children transparently
// ---------------------------------------------------------------------------
vi.mock("react-zoom-pan-pinch", () => ({
  TransformWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="transform-wrapper">{children}</div>
  ),
  TransformComponent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="transform-component">{children}</div>
  ),
  useControls: () => ({
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetTransform: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Import AFTER mocks
// ---------------------------------------------------------------------------
import { SpotlightContainer } from "@/app/_components/sun-kudos/spotlight-container";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildNode(over: Partial<SpotlightNode> = {}): SpotlightNode {
  return {
    user_id: "u1",
    name: "Nguyen Van A",
    received_count: 10,
    last_received_at: "2026-05-15T08:30:00",
    ...over,
  };
}

/** Minimal required props for SpotlightContainer. */
const defaultProps = {
  totalKudos: 388,
  nodes: [] as SpotlightNode[],
  onNodeClick: vi.fn(),
  onSearchChange: vi.fn(),
};

/**
 * Render SpotlightContainer inside act(async) so the dynamic `import("d3-cloud")`
 * inside SpotlightWordCloud's useEffect fully resolves and setPlaced fires before
 * assertions run.
 */
async function renderWithNodes(ui: React.ReactElement): Promise<void> {
  await act(async () => {
    render(ui);
  });
}

/**
 * Find the word-cloud SVG <text> element by name.
 *
 * The component renders several SVGs (toolbar icons + the word-cloud).
 * The word-cloud SVG has viewBox="0 0 1100 420". We select it specifically
 * to avoid matching toolbar icon SVGs that contain no <text> children.
 *
 * The marquee strip also renders node names as <span> — scoping to the SVG
 * prevents ambiguous matches.
 */
function getCloudSvgText(name: string): SVGTextElement {
  const svg = document.querySelector('svg[viewBox="0 0 1100 420"]');
  if (!svg) throw new Error("Word-cloud SVG (viewBox=0 0 1100 420) not found");
  const found = Array.from(svg.querySelectorAll("text")).find(
    (t) => t.textContent === name
  );
  if (!found) {
    throw new Error(`SVG <text> "${name}" not found in word-cloud SVG`);
  }
  return found as SVGTextElement;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("<SpotlightContainer />", () => {
  // --- Section heading ----------------------------------------------------
  it("renders 'SPOTLIGHT BOARD' section heading", () => {
    render(<SpotlightContainer {...defaultProps} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "SPOTLIGHT BOARD" })
    ).toBeInTheDocument();
  });

  // --- Kudos heading ------------------------------------------------------
  // Per B.7 design: total count renders as a centered "{n} KUDOS" <h3> heading.
  it("renders supplied totalKudos=388 value in the heading", () => {
    render(<SpotlightContainer {...defaultProps} totalKudos={388} />);
    expect(
      screen.getByRole("heading", { level: 3, name: /388 KUDOS/ })
    ).toBeInTheDocument();
  });

  it("renders supplied totalKudos value in the heading", () => {
    render(<SpotlightContainer {...defaultProps} totalKudos={1234} />);
    expect(
      screen.getByRole("heading", { level: 3, name: /1234 KUDOS/ })
    ).toBeInTheDocument();
  });

  // --- Toolbar: search UI -------------------------------------------------
  it("renders the search input with placeholder text", () => {
    render(<SpotlightContainer {...defaultProps} />);
    expect(screen.getByPlaceholderText("Tìm kiếm")).toBeInTheDocument();
  });

  // --- Toolbar: pan/zoom toggle -------------------------------------------
  it("pan/zoom button is initially aria-pressed=true (panning enabled by default)", () => {
    render(<SpotlightContainer {...defaultProps} />);
    // panningDisabled starts false → aria-pressed={!false} = true
    const btn = screen.getByRole("button", { name: "Tắt chế độ Pan và Zoom" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("clicking pan/zoom toggle flips aria-pressed", async () => {
    const user = userEvent.setup();
    render(<SpotlightContainer {...defaultProps} />);

    const btn = screen.getByRole("button", { name: "Tắt chế độ Pan và Zoom" });
    expect(btn).toHaveAttribute("aria-pressed", "true");

    await user.click(btn);
    // panningDisabled=true → aria-pressed=false; label also changes
    expect(
      screen.getByRole("button", { name: "Bật chế độ Pan và Zoom" })
    ).toHaveAttribute("aria-pressed", "false");

    await user.click(
      screen.getByRole("button", { name: "Bật chế độ Pan và Zoom" })
    );
    // Restored: panningDisabled=false → aria-pressed=true
    expect(
      screen.getByRole("button", { name: "Tắt chế độ Pan và Zoom" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("pan/zoom button aria-label reflects current panning state", async () => {
    const user = userEvent.setup();
    render(<SpotlightContainer {...defaultProps} />);

    // Initial: panning active → "Tắt chế độ Pan và Zoom"
    expect(
      screen.getByRole("button", { name: "Tắt chế độ Pan và Zoom" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Tắt chế độ Pan và Zoom" })
    );
    // After disable: "Bật chế độ Pan và Zoom"
    expect(
      screen.getByRole("button", { name: "Bật chế độ Pan và Zoom" })
    ).toBeInTheDocument();
  });

  // --- Loading state ------------------------------------------------------
  it("renders skeleton cloud when loading=true", () => {
    const { container } = render(
      <SpotlightContainer {...defaultProps} loading={true} />
    );
    const skeletonBlobs = container.querySelectorAll(".animate-pulse");
    expect(skeletonBlobs.length).toBeGreaterThanOrEqual(12);
  });

  it("does not render word cloud when loading=true", () => {
    render(<SpotlightContainer {...defaultProps} loading={true} />);
    const svg = document.querySelector('svg[viewBox="0 0 1100 420"]');
    expect(svg).toBeNull();
  });

  // --- Empty state --------------------------------------------------------
  it("renders empty state text when !loading and nodes is empty", () => {
    render(<SpotlightContainer {...defaultProps} nodes={[]} loading={false} />);
    expect(
      screen.getByText("Chưa có Kudos nào để hiển thị.")
    ).toBeInTheDocument();
  });

  // --- onSearchChange wiring ---------------------------------------------
  it("calls onSearchChange after typing in search input (debounced 200ms)", async () => {
    const onSearchChange = vi.fn();
    render(
      <SpotlightContainer
        {...defaultProps}
        onSearchChange={onSearchChange}
      />
    );

    const input = screen.getByPlaceholderText("Tìm kiếm");
    // Use fireEvent.change to trigger the onChange handler directly,
    // then advance timers to flush the 200ms debounce.
    await act(async () => {
      fireEvent.change(input, { target: { value: "Alice" } });
      await new Promise((r) => setTimeout(r, 250));
    });

    expect(onSearchChange).toHaveBeenCalledWith("Alice");
  });

  // --- Activity log stack (per design B.7, node 2940:14230) --------------
  it("renders an activity log line for each node when nodes supplied", async () => {
    const nodes = [
      buildNode({
        user_id: "u1",
        name: "AliceActivity",
        last_received_at: "2026-05-26T08:30:00Z",
      }),
      buildNode({
        user_id: "u2",
        name: "BobActivity",
        last_received_at: "2026-05-26T07:15:00Z",
      }),
    ];
    await renderWithNodes(
      <SpotlightContainer {...defaultProps} nodes={nodes} />
    );
    // Stack renders each entry once: "HH:MMam/pm Name đã nhận được một Kudos mới".
    expect(
      screen.getByText(/AliceActivity đã nhận được một Kudos mới/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BobActivity đã nhận được một Kudos mới/)
    ).toBeInTheDocument();
  });

  it("does not render the activity log when nodes array is empty", () => {
    render(<SpotlightContainer {...defaultProps} nodes={[]} />);
    expect(
      screen.queryByText(/đã nhận được một Kudos mới/)
    ).not.toBeInTheDocument();
  });

  // --- onNodeClick wires through -----------------------------------------
  // Uses fireEvent.click on SVG <text> nodes: userEvent.click hangs in jsdom
  // on SVG elements due to pointer-events simulation overhead.
  it("calls external onNodeClick when a word SVG node is clicked", async () => {
    const onNodeClick = vi.fn();
    const node = buildNode({ user_id: "click-u", name: "ClickTarget" });

    await renderWithNodes(
      <SpotlightContainer
        {...defaultProps}
        nodes={[node]}
        onNodeClick={onNodeClick}
      />
    );

    const svgText = getCloudSvgText("ClickTarget");
    fireEvent.click(svgText);

    expect(onNodeClick).toHaveBeenCalledOnce();
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it("toggles internal highlight when onNodeClick is called", async () => {
    const onNodeClick = vi.fn();
    const node = buildNode({ user_id: "toggle-u", name: "ToggleTarget" });

    await renderWithNodes(
      <SpotlightContainer
        {...defaultProps}
        nodes={[node]}
        onNodeClick={onNodeClick}
      />
    );

    const svgText = getCloudSvgText("ToggleTarget");

    // Before click: default white fill (no highlight)
    expect(svgText).toHaveAttribute("fill", "#FFFFFF");

    fireEvent.click(svgText);
    // After click: internal highlight set → fill changes to #FF5252
    expect(svgText).toHaveAttribute("fill", "#FF5252");

    fireEvent.click(svgText);
    // Second click toggles back off → white again
    expect(svgText).toHaveAttribute("fill", "#FFFFFF");
  });

  // --- External highlightedUserId prop -----------------------------------
  it("respects externally supplied highlightedUserId prop", async () => {
    const nodes = [
      buildNode({ user_id: "ext-h", name: "ExtHighlight" }),
      buildNode({ user_id: "other", name: "ExtNormal" }),
    ];

    await renderWithNodes(
      <SpotlightContainer
        {...defaultProps}
        nodes={nodes}
        highlightedUserId="ext-h"
      />
    );

    expect(getCloudSvgText("ExtHighlight")).toHaveAttribute("fill", "#FF5252");
    expect(getCloudSvgText("ExtNormal")).toHaveAttribute("fill", "#FFFFFF");
  });

  // --- Section landmark --------------------------------------------------
  it("wraps content in a <section> with aria-labelledby pointing to the heading", () => {
    const { container } = render(<SpotlightContainer {...defaultProps} />);
    const section = container.querySelector(
      "section[aria-labelledby='spotlight-heading']"
    );
    expect(section).not.toBeNull();
  });
});
