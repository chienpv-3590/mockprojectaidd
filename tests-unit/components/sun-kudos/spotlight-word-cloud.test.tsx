import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SpotlightNode } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// d3-cloud mock — synchronously calls the "end" handler with echoed words
// so we never wait on a real async layout pass.
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
        // Immediately fire "end" with words that have x/y/rotate/size set
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
// Import AFTER mocks are registered
// ---------------------------------------------------------------------------
import { SpotlightWordCloud } from "@/app/_components/sun-kudos/spotlight-word-cloud";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildNode(over: Partial<SpotlightNode> = {}): SpotlightNode {
  return {
    user_id: "u1",
    name: "Nguyen Van A",
    received_count: 10,
    last_received_at: "2026-05-15T08:30:00",
    latest_kudos_id: null,
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("<SpotlightWordCloud />", () => {
  it("renders empty-state message when nodes array is empty", () => {
    render(
      <SpotlightWordCloud
        nodes={[]}
        onNodeClick={vi.fn()}
      />
    );
    expect(screen.getByText("Chưa có dữ liệu")).toBeInTheDocument();
  });

  it("does not crash with an empty nodes array", () => {
    expect(() =>
      render(<SpotlightWordCloud nodes={[]} onNodeClick={vi.fn()} />)
    ).not.toThrow();
  });

  it("renders word text inside SVG after d3-cloud layout completes", async () => {
    await act(async () => {
      render(
        <SpotlightWordCloud
          nodes={[buildNode({ name: "Tran Thi B", user_id: "u2" })]}
          onNodeClick={vi.fn()}
        />
      );
    });
    expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
  });

  it("renders one <text> element per node", async () => {
    const nodes = [
      buildNode({ user_id: "u1", name: "Alice" }),
      buildNode({ user_id: "u2", name: "Bob" }),
      buildNode({ user_id: "u3", name: "Charlie" }),
    ];
    await act(async () => {
      render(<SpotlightWordCloud nodes={nodes} onNodeClick={vi.fn()} />);
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("calls onNodeClick with the matching SpotlightNode when a word is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const node = buildNode({ user_id: "u-click", name: "ClickMe" });

    await act(async () => {
      render(<SpotlightWordCloud nodes={[node]} onNodeClick={onClick} />);
    });

    await user.click(screen.getByText("ClickMe"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(node);
  });

  it("applies highlighted fill (#FF5252) to the highlighted node; others stay white", async () => {
    const nodes = [
      buildNode({ user_id: "highlighted-id", name: "StarUser" }),
      buildNode({ user_id: "normal-id", name: "NormalUser" }),
    ];

    await act(async () => {
      render(
        <SpotlightWordCloud
          nodes={nodes}
          highlightedUserId="highlighted-id"
          onNodeClick={vi.fn()}
        />
      );
    });

    const highlighted = screen.getByText("StarUser");
    const normal = screen.getByText("NormalUser");
    // Per B.7 design: names render WHITE; only highlighted node turns red.
    expect(highlighted).toHaveAttribute("fill", "#FF5252");
    expect(normal).toHaveAttribute("fill", "#FFFFFF");
  });

  it("highlighted node has opacity 1; non-highlighted nodes dim to opacity 0.35", async () => {
    const nodes = [
      buildNode({ user_id: "h-id", name: "Hero" }),
      buildNode({ user_id: "n-id", name: "Normal" }),
    ];

    await act(async () => {
      render(
        <SpotlightWordCloud
          nodes={nodes}
          highlightedUserId="h-id"
          onNodeClick={vi.fn()}
        />
      );
    });

    // Highlighted node: full opacity; others: dimmed to 0.35 per spec B.7
    expect(screen.getByText("Hero")).toHaveAttribute("opacity", "1");
    expect(screen.getByText("Normal")).toHaveAttribute("opacity", "0.35");
  });

  it("when no highlightedUserId all nodes use default fill and opacity", async () => {
    const nodes = [
      buildNode({ user_id: "a", name: "Alpha" }),
      buildNode({ user_id: "b", name: "Beta" }),
    ];

    await act(async () => {
      render(<SpotlightWordCloud nodes={nodes} onNodeClick={vi.fn()} />);
    });

    // No highlight active → all names white at the default 0.75 opacity.
    expect(screen.getByText("Alpha")).toHaveAttribute("fill", "#FFFFFF");
    expect(screen.getByText("Alpha")).toHaveAttribute("opacity", "0.75");
    expect(screen.getByText("Beta")).toHaveAttribute("fill", "#FFFFFF");
  });

  it("wraps placed words in TransformWrapper/TransformComponent when panningDisabled=false", async () => {
    await act(async () => {
      render(
        <SpotlightWordCloud
          nodes={[buildNode()]}
          onNodeClick={vi.fn()}
          panningDisabled={false}
        />
      );
    });
    expect(screen.getByTestId("transform-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("transform-component")).toBeInTheDocument();
  });
});
