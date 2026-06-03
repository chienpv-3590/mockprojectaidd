/**
 * Characterization (regression) tests for <LiveBoardClient />.
 *
 * Strategy:
 *  - Stub heavy child components (HighlightCarousel, SpotlightContainer, KudosFeed,
 *    SubmitKudosDialog, KudosSidebar) with minimal test-id sentinels so assertions
 *    focus on prop-flow and action wiring, not internal rendering.
 *  - Let lightweight presentational components (KudosHero, SubmitInput, SunnerSearchInput,
 *    ToastContainer) render real.
 *  - Mock all server actions and supabase client at module boundaries.
 *  - Mock next/navigation useRouter.
 *  - Realtime channel mock prevents real Supabase calls; hooks run real logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// ---------------------------------------------------------------------------
// Module mocks — must be declared before imports that consume them
// ---------------------------------------------------------------------------

// Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

// next/navigation
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockRouterPush })),
}));

// Server actions
const mockFetchKudosCard = vi.fn();
const mockRefetchHighlight = vi.fn();
const mockRefetchFeed = vi.fn();
const mockSearchSunners = vi.fn();
const mockSubmitKudos = vi.fn();
const mockToggleHeart = vi.fn();
const mockOpenSecretBox = vi.fn();
const mockGetNextUnopenedBox = vi.fn();

vi.mock("@/app/_actions/sun-kudos", () => ({
  fetchKudosCard: (...args: unknown[]) => mockFetchKudosCard(...args),
  refetchHighlight: (...args: unknown[]) => mockRefetchHighlight(...args),
  refetchFeed: (...args: unknown[]) => mockRefetchFeed(...args),
  searchSunners: (...args: unknown[]) => mockSearchSunners(...args),
  submitKudos: (...args: unknown[]) => mockSubmitKudos(...args),
  toggleHeart: (...args: unknown[]) => mockToggleHeart(...args),
  openSecretBox: (...args: unknown[]) => mockOpenSecretBox(...args),
  getNextUnopenedBox: (...args: unknown[]) => mockGetNextUnopenedBox(...args),
}));

// Storage (the `mock` prefix lets vitest reference it inside the hoisted factory)
const mockUploadKudosImage = vi
  .fn()
  .mockResolvedValue({ path: "user-1/upload.jpg" });
vi.mock("@/lib/storage/kudos-images", () => ({
  uploadKudosImage: (...args: unknown[]) => mockUploadKudosImage(...args),
}));

// Realtime channel — prevents real Supabase subscriptions
vi.mock("@/lib/realtime/kudos-channel", () => ({
  subscribeToKudos: vi.fn(() => ({ unsubscribe: vi.fn() })),
  subscribeToHearts: vi.fn(() => ({ unsubscribe: vi.fn() })),
}));

// ---------------------------------------------------------------------------
// Stub heavy child components with minimal test-id sentinels
// ---------------------------------------------------------------------------

vi.mock("@/app/_components/sun-kudos/highlight-carousel", () => ({
  HighlightCarousel: (props: {
    kudos?: unknown[];
    selectedHashtagId?: string;
    selectedDepartmentCode?: string;
    onSelectHashtag?: (id: string | null) => void;
    onSelectDepartment?: (code: string | null) => void;
    onHeartToggle?: (id: string) => void;
  }) => (
    <div
      data-testid="highlight-carousel"
      data-count={props.kudos?.length ?? 0}
      data-filter={props.selectedHashtagId ?? ""}
      data-dept={props.selectedDepartmentCode ?? ""}
    >
      <button
        data-testid="filter-btn"
        onClick={() => props.onSelectHashtag?.("ht-1")}
      >
        filter
      </button>
      <button
        data-testid="filter-dept-btn"
        onClick={() => props.onSelectDepartment?.("CEVC1")}
      >
        filter-dept
      </button>
      {/* Re-clicking the active dropdown option clears the filter
          (FilterDropdown contract). This test button simulates that path. */}
      <button
        data-testid="clear-hashtag-btn"
        onClick={() => props.onSelectHashtag?.(null)}
      >
        clear-hashtag
      </button>
      <button
        data-testid="highlight-heart-btn"
        onClick={() => props.onHeartToggle?.("card-h1")}
      >
        heart-highlight
      </button>
    </div>
  ),
}));

vi.mock("@/app/_components/sun-kudos/spotlight-container", () => ({
  SpotlightContainer: (props: {
    totalKudos?: number;
    nodes?: { user_id: string; name: string }[];
    highlightedUserId?: string;
    onNodeClick?: (node: { user_id: string; name: string }) => void;
  }) => (
    <div
      data-testid="spotlight-container"
      data-highlighted={props.highlightedUserId ?? ""}
    >
      {props.nodes?.map((n) => (
        <button
          key={n.user_id}
          data-testid={`node-${n.user_id}`}
          onClick={() => props.onNodeClick?.(n)}
        >
          {n.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("@/app/_components/sun-kudos/kudos-feed", () => ({
  KudosFeed: (props: {
    initialKudos?: { id: string }[];
    onLoadMore?: () => void;
    onHeartToggle?: (id: string) => void;
    onViewDetail?: (id: string) => void;
  }) => (
    <div data-testid="kudos-feed" data-count={props.initialKudos?.length ?? 0}>
      <button
        data-testid="load-more-btn"
        onClick={() => props.onLoadMore?.()}
      >
        load-more
      </button>
      <button
        data-testid="feed-heart-btn"
        onClick={() => props.onHeartToggle?.("card-f1")}
      >
        heart-feed
      </button>
      <button
        data-testid="feed-view-btn"
        onClick={() => props.onViewDetail?.("card-f1")}
      >
        view-feed
      </button>
    </div>
  ),
}));

// The dialog stub catches errors from onSubmit so they don't become unhandled
// rejections. This mirrors what the real dialog does (sets submitting=false on
// catch). A separate data-testid="submit-error-status" element surfaces the
// error so tests can assert on it when needed.
//
// Note: useState is imported from React directly (not via require) so that
// TypeScript can resolve the generic overloads.
vi.mock("@/app/_components/sun-kudos/submit-kudos-dialog", () => ({
  SubmitKudosDialog: (props: {
    open?: boolean;
    onClose?: () => void;
    onUpload?: (file: File) => Promise<string>;
    onSubmit?: (input: {
      to_user: string;
      message: string;
      feature_hashtag_id: string;
      small_hashtag_ids: string[];
      image_paths: string[];
    }) => Promise<void>;
  }) => {
    const [lastError, setLastError] = React.useState<string | null>(null);
    const [uploadedPath, setUploadedPath] = React.useState<string | null>(null);
    if (!props.open) return null;
    const handleUpload = async () => {
      const file = new File(["x"], "pic.png", { type: "image/png" });
      const path = await props.onUpload?.(file);
      setUploadedPath(path ?? null);
    };
    const handleSubmit = async () => {
      setLastError(null);
      try {
        await props.onSubmit?.({
          to_user: "user-target",
          message: "Thanks!",
          feature_hashtag_id: "fh-1",
          small_hashtag_ids: [],
          image_paths: [],
        });
      } catch (err: unknown) {
        setLastError(err instanceof Error ? err.message : "error");
      }
    };
    return (
      <div data-testid="submit-dialog">
        <button data-testid="dialog-close-btn" onClick={() => props.onClose?.()}>
          close
        </button>
        <button data-testid="dialog-submit-btn" onClick={handleSubmit}>
          submit
        </button>
        <button data-testid="dialog-upload-btn" onClick={handleUpload}>
          upload
        </button>
        {uploadedPath && (
          <span data-testid="uploaded-path">{uploadedPath}</span>
        )}
        {lastError && (
          <span data-testid="submit-error-status">{lastError}</span>
        )}
      </div>
    );
  },
}));

vi.mock("@/app/_components/sun-kudos/kudos-sidebar", () => ({
  KudosSidebar: (props: {
    stats?: { secretBoxPending?: number };
    onOpenSecretBox?: () => void;
  }) => (
    <div
      data-testid="kudos-sidebar"
      data-pending={props.stats?.secretBoxPending ?? 0}
    >
      <button
        data-testid="open-secret-box-btn"
        onClick={() => props.onOpenSecretBox?.()}
      >
        Mở Secret Box
      </button>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Component under test
// ---------------------------------------------------------------------------

import { LiveBoardClient } from "@/app/_components/sun-kudos/live-board-client";
import type { LiveBoardInitialData } from "@/app/_components/sun-kudos/live-board-client";
import type { KudosCardData as DbCard } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function buildDbCard(over: Partial<DbCard> = {}): DbCard {
  return {
    id: "card-1",
    message: "Great work!",
    title: null,
    is_anonymous: false,
    created_at: "2026-05-26T08:00:00.000Z",
    sender: {
      user_id: "user-s",
      full_name_vi: "Sender Name",
      department_code: "ENG",
      department_name_vi: "Engineering",
      employee_code: "E001",
      title: "Engineer",
      avatar_url: null,
      tier: 0,
    },
    receiver: {
      user_id: "user-r",
      full_name_vi: "Receiver Name",
      department_code: "ENG",
      department_name_vi: "Engineering",
      employee_code: "E002",
      title: "Designer",
      avatar_url: null,
      tier: 0,
    },
    feature_hashtag: {
      id: "fh-1",
      code: "excellence",
      label_vi: "Xuất sắc",
      kind: "feature",
      display_order: 1,
    },
    small_hashtags: [],
    images: [],
    heart_count: 0,
    liked_by_me: false,
    can_like: true,
    ...over,
  };
}

const baseInitial = (): LiveBoardInitialData => ({
  highlightRows: [],
  feedRows: [],
  feedNextCursor: null,
  stats: {
    kudosReceived: 0,
    kudosSent: 0,
    hearts: 0,
    secretBoxOpened: 0,
    secretBoxPending: 0,
  },
  recipients: [],
  spotlightNodes: [],
  totalKudos: 0,
  featureHashtags: [],
  smallHashtags: [],
  departments: [],
});

// ---------------------------------------------------------------------------
// Global test setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockRouterPush.mockClear();
  mockFetchKudosCard.mockClear();
  mockRefetchHighlight.mockResolvedValue([]);
  mockRefetchFeed.mockResolvedValue({ rows: [], nextCursor: null });
  mockSubmitKudos.mockResolvedValue({ id: "new-kudos" });
  mockToggleHeart.mockResolvedValue({ liked: true, heart_count: 1, weight_applied: 1 });
  mockOpenSecretBox.mockResolvedValue({ reward_label_vi: "Áo SAA" });
  mockGetNextUnopenedBox.mockResolvedValue({ id: "box-1" });
  mockSearchSunners.mockResolvedValue([]);

  // IntersectionObserver stub — KudosFeed registers one on mount
  class ObserverStub {
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = ObserverStub;
});

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).IntersectionObserver;
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("<LiveBoardClient />", () => {
  // ── Test 1: basic render ──────────────────────────────────────────────────
  it("renders all major sections without crashing (empty initial data)", () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    expect(screen.getByTestId("highlight-carousel")).toBeInTheDocument();
    expect(screen.getByTestId("spotlight-container")).toBeInTheDocument();
    expect(screen.getByTestId("kudos-feed")).toBeInTheDocument();
    expect(screen.getByTestId("kudos-sidebar")).toBeInTheDocument();
  });

  // ── Test 2: SubmitInput click → dialog opens ─────────────────────────────
  it("clicking SubmitInput opens the submit dialog", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    expect(screen.queryByTestId("submit-dialog")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      })
    );
    expect(screen.getByTestId("submit-dialog")).toBeInTheDocument();
  });

  // ── Test 3: dialog close → dialogOpen=false ───────────────────────────────
  it("clicking dialog close button hides the dialog", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      })
    );
    expect(screen.getByTestId("submit-dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("dialog-close-btn"));
    expect(screen.queryByTestId("submit-dialog")).not.toBeInTheDocument();
  });

  // ── Test 4: dialog submit success → calls submitKudos + shows toast ───────
  it("dialog submit calls submitKudos with correct payload and shows success toast", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      })
    );

    await userEvent.click(screen.getByTestId("dialog-submit-btn"));

    await waitFor(() => {
      expect(mockSubmitKudos).toHaveBeenCalledWith({
        to_user: "user-target",
        message: "Thanks!",
        feature_hashtag_id: "fh-1",
        small_hashtag_ids: [],
        image_paths: [],
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Đã gửi lời cảm ơn!")).toBeInTheDocument();
    });
  });

  // ── Test 4b: image upload uses the uploader's UID as the storage path ─────
  //
  // Regression: the upload previously hard-coded "temp" as the path prefix,
  // which the kudos-images storage RLS INSERT policy rejects (it requires
  // auth.uid() = first path segment). The prefix MUST be currentUserId.
  it("dialog image upload passes currentUserId as the storage path prefix", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      })
    );

    await userEvent.click(screen.getByTestId("dialog-upload-btn"));

    await waitFor(() => {
      expect(mockUploadKudosImage).toHaveBeenCalledTimes(1);
    });
    // signature: (supabase, kudosId/prefix, buffer, contentType)
    const [, prefix, , contentType] = mockUploadKudosImage.mock.calls[0];
    expect(prefix).toBe("user-1");
    expect(prefix).not.toBe("temp");
    expect(contentType).toBe("image/png");

    await waitFor(() => {
      expect(screen.getByTestId("uploaded-path")).toHaveTextContent(
        "user-1/upload.jpg"
      );
    });
  });

  // ── Test 5: submitKudos error → error surfaced in dialog stub ─────────────
  //
  // handleSubmitKudos() in the orchestrator does NOT call showToast on error —
  // it re-throws so the dialog can handle its own error state. The dialog stub
  // catches the rejection and stores it in data-testid="submit-error-status".
  it("submitKudos failure propagates the error to the dialog (no orchestrator-level toast)", async () => {
    mockSubmitKudos.mockRejectedValueOnce(new Error("submit_failed"));

    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
      })
    );

    await userEvent.click(screen.getByTestId("dialog-submit-btn"));

    await waitFor(() => expect(mockSubmitKudos).toHaveBeenCalledTimes(1));

    // The orchestrator-level success toast must NOT appear
    expect(screen.queryByText("Đã gửi lời cảm ơn!")).not.toBeInTheDocument();
    // The dialog stub surfaced the error
    await waitFor(() => {
      expect(screen.getByTestId("submit-error-status")).toHaveTextContent(
        "submit_failed"
      );
    });
  });

  // ── Test 6: heart click on feed card → calls toggleHeart ─────────────────
  it("heart click on a feed card calls toggleHeart action", async () => {
    const initial = baseInitial();
    initial.feedRows = [buildDbCard({ id: "card-f1", heart_count: 2, liked_by_me: false })];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("feed-heart-btn"));

    await waitFor(() => {
      expect(mockToggleHeart).toHaveBeenCalledWith({ kudos_id: "card-f1" });
    });
  });

  // ── Test 7: toggleHeart "cannot_like_own_kudos" → no toast ───────────────
  it("toggleHeart cannot_like_own_kudos error shows no toast", async () => {
    mockToggleHeart.mockRejectedValueOnce(new Error("cannot_like_own_kudos"));

    const initial = baseInitial();
    initial.feedRows = [buildDbCard({ id: "card-f1" })];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("feed-heart-btn"));

    await waitFor(() => expect(mockToggleHeart).toHaveBeenCalled());

    // Silenced — no error toast for self-heart
    expect(
      screen.queryByText("Không thể thả tim, vui lòng thử lại.")
    ).not.toBeInTheDocument();
  });

  // ── Test 8: toggleHeart generic error → rollback + error toast ───────────
  it("toggleHeart generic error shows error toast", async () => {
    mockToggleHeart.mockRejectedValueOnce(new Error("network_failure"));

    const initial = baseInitial();
    initial.feedRows = [buildDbCard({ id: "card-f1" })];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("feed-heart-btn"));

    await waitFor(() => {
      expect(
        screen.getByText("Không thể thả tim, vui lòng thử lại.")
      ).toBeInTheDocument();
    });
  });

  // ── Test 9: filter change → calls refetchHighlight + refetchFeed ──────────
  it("filter chip click calls refetchHighlight and refetchFeed", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("filter-btn"));

    await waitFor(() => {
      expect(mockRefetchHighlight).toHaveBeenCalled();
      expect(mockRefetchFeed).toHaveBeenCalled();
    });
  });

  // ── Test 9b: re-selecting the active hashtag clears it → re-fetches with no filters ──
  it("clearing the hashtag (onSelectHashtag(null)) re-fetches highlight + feed without filters", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    // Apply a hashtag filter first, then clear it via the dropdown contract.
    await userEvent.click(screen.getByTestId("filter-btn"));
    await userEvent.click(screen.getByTestId("clear-hashtag-btn"));

    await waitFor(() => {
      expect(mockRefetchHighlight).toHaveBeenLastCalledWith(undefined);
      expect(mockRefetchFeed).toHaveBeenLastCalledWith(undefined, undefined);
    });
  });

  // ── Test 10: load-more → calls refetchFeed with cursor ───────────────────
  it("load-more button calls refetchFeed with the current nextCursor", async () => {
    const initial = baseInitial();
    initial.feedNextCursor = "cursor-1";

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("load-more-btn"));

    await waitFor(() => {
      expect(mockRefetchFeed).toHaveBeenCalledWith("cursor-1", {});
    });
  });

  // ── Test 11a: spotlight node click → always navigates to the user's profile
  it("spotlight node click navigates to /sun-kudos/profile/{user_id} (even when latest_kudos_id is set)", async () => {
    const initial = baseInitial();
    initial.spotlightNodes = [
      {
        user_id: "u-spot",
        name: "Spotlight User",
        received_count: 5,
        last_received_at: "2026-05-26",
        latest_kudos_id: "kudos-latest-99",
      },
    ];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("node-u-spot"));

    expect(mockRouterPush).toHaveBeenCalledWith("/sun-kudos/profile/u-spot");
    // Must NOT open the detail popup for the latest kudos.
    expect(mockFetchKudosCard).not.toHaveBeenCalledWith("kudos-latest-99");
  });

  // ── Test 11c: feed card view → opens detail popup (no navigation) ─────────
  it("feed card onViewDetail fetches the card for the popup (no navigation)", async () => {
    mockFetchKudosCard.mockResolvedValue(null);

    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("feed-view-btn"));

    await waitFor(() => {
      expect(mockFetchKudosCard).toHaveBeenCalledWith("card-f1");
    });
    expect(mockRouterPush).not.toHaveBeenCalledWith("/sun-kudos/card-f1");
  });

  // ── Test 11b: spotlight node click also navigates to profile when latest_kudos_id is null
  it("spotlight node click without latest_kudos_id still navigates to profile", async () => {
    const initial = baseInitial();
    initial.spotlightNodes = [
      {
        user_id: "u-empty",
        name: "Empty User",
        received_count: 0,
        last_received_at: "",
        latest_kudos_id: null,
      },
    ];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("node-u-empty"));

    expect(mockRouterPush).toHaveBeenCalledWith("/sun-kudos/profile/u-empty");
  });

  // ── Test 12: secret box happy path ───────────────────────────────────────
  it("secret box flow: getNextUnopenedBox → openSecretBox → reward toast", async () => {
    const initial = baseInitial();
    initial.stats = { ...initial.stats, secretBoxPending: 1 };

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("open-secret-box-btn"));

    await waitFor(() => {
      expect(mockGetNextUnopenedBox).toHaveBeenCalledTimes(1);
      expect(mockOpenSecretBox).toHaveBeenCalledWith({ box_id: "box-1" });
    });
    await waitFor(() => {
      expect(screen.getByText("Bạn nhận được: Áo SAA")).toBeInTheDocument();
    });
  });

  // ── Test 13: secret box — zero pending → error toast, no fetch ───────────
  it("clicking secret box with 0 pending shows error toast and skips fetch", async () => {
    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("open-secret-box-btn"));

    await waitFor(() => {
      expect(
        screen.getByText("Bạn không có Secret Box chưa mở.")
      ).toBeInTheDocument();
    });
    expect(mockGetNextUnopenedBox).not.toHaveBeenCalled();
  });

  // ── Test 14: getNextUnopenedBox returns null → error toast ───────────────
  it("getNextUnopenedBox returning null shows 'not found' error toast", async () => {
    mockGetNextUnopenedBox.mockResolvedValueOnce(null);

    const initial = baseInitial();
    initial.stats = { ...initial.stats, secretBoxPending: 1 };

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("open-secret-box-btn"));

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy Secret Box.")).toBeInTheDocument();
    });
  });

  // ── Test 15: sunner search → results dropdown → navigate to profile ──────
  it("picking a sunner search result navigates to that profile", async () => {
    mockSearchSunners.mockResolvedValueOnce([
      {
        user_id: "u-match",
        full_name_vi: "Nguyen Van A",
        department_code: "CEVC1",
        department_name_vi: "CEVC1 Team",
        employee_code: "SUN001",
        title: "Engineer",
        avatar_url: null,
        tier: 0,
      },
    ]);

    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.type(screen.getByPlaceholderText("Tìm kiếm sunner"), "Nguyen");

    const result = await screen.findByText("Nguyen Van A");
    await userEvent.click(result);

    expect(mockRouterPush).toHaveBeenCalledWith("/sun-kudos/profile/u-match");
  });

  // ── Test 16: sunner search with no match → empty-state message ───────────
  it("sunner search shows an empty-state message when nothing matches", async () => {
    mockSearchSunners.mockResolvedValueOnce([]);

    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.type(screen.getByPlaceholderText("Tìm kiếm sunner"), "zzz");

    expect(await screen.findByText("Không tìm thấy Sunner")).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  // ── Test 17: initial highlight rows → HighlightCarousel data-count ───────
  it("initial highlight rows are passed through to HighlightCarousel", () => {
    const initial = baseInitial();
    initial.highlightRows = [buildDbCard({ id: "h1" }), buildDbCard({ id: "h2" })];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    expect(screen.getByTestId("highlight-carousel")).toHaveAttribute("data-count", "2");
  });

  // ── Test 18: openSecretBox "box_already_opened" → specific toast ─────────
  it("openSecretBox box_already_opened error shows correct Vietnamese message", async () => {
    mockOpenSecretBox.mockRejectedValueOnce(new Error("box_already_opened"));

    const initial = baseInitial();
    initial.stats = { ...initial.stats, secretBoxPending: 1 };

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("open-secret-box-btn"));

    await waitFor(() => {
      expect(screen.getByText("Hộp này đã được mở rồi.")).toBeInTheDocument();
    });
  });

  // ── Test 19: filter change fetch error → error toast ─────────────────────
  it("filter change fetch failure shows error toast", async () => {
    mockRefetchHighlight.mockRejectedValueOnce(new Error("network_error"));

    render(<LiveBoardClient initial={baseInitial()} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("filter-btn"));

    await waitFor(() => {
      expect(
        screen.getByText("Không thể tải dữ liệu, vui lòng thử lại.")
      ).toBeInTheDocument();
    });
  });

  // ── Test 20: heart click on highlight card → calls toggleHeart ───────────
  it("heart click on a highlight card calls toggleHeart action", async () => {
    const initial = baseInitial();
    initial.highlightRows = [buildDbCard({ id: "card-h1", liked_by_me: false })];

    render(<LiveBoardClient initial={initial} currentUserId="user-1" />);
    await userEvent.click(screen.getByTestId("highlight-heart-btn"));

    await waitFor(() => {
      expect(mockToggleHeart).toHaveBeenCalledWith({ kudos_id: "card-h1" });
    });
  });
});
