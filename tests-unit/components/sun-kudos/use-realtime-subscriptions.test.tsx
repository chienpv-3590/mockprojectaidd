import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/lib/realtime/kudos-channel", () => {
  let kudosCb: ((row: Record<string, unknown>) => void) | null = null;
  let heartsCb:
    | ((row: {
        kudos_id: string;
        user_id: string;
        weight: number;
        deleted: boolean;
      }) => void)
    | null = null;
  const kudosUnsubscribe = vi.fn();
  const heartsUnsubscribe = vi.fn();
  return {
    subscribeToKudos: vi.fn((_supabase: unknown, cb) => {
      kudosCb = cb;
      return { unsubscribe: kudosUnsubscribe };
    }),
    subscribeToHearts: vi.fn((_supabase: unknown, cb) => {
      heartsCb = cb;
      return { unsubscribe: heartsUnsubscribe };
    }),
    // exposed for tests
    __triggerKudos: (row: Record<string, unknown>) => kudosCb?.(row),
    __triggerHeart: (row: {
      kudos_id: string;
      user_id: string;
      weight: number;
      deleted: boolean;
    }) => heartsCb?.(row),
    __unsubscribeMocks: { kudosUnsubscribe, heartsUnsubscribe },
  };
});

import { useRealtimeSubscriptions } from "@/app/_components/sun-kudos/_hooks/use-realtime-subscriptions";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as channelMock from "@/lib/realtime/kudos-channel";

describe("useRealtimeSubscriptions()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("subscribes to kudos + hearts on mount", () => {
    const onNewKudos = vi.fn();
    const onHeartChange = vi.fn();
    const supabase = {} as never;

    renderHook(() =>
      useRealtimeSubscriptions({
        supabase,
        currentUserId: "viewer",
        onNewKudos,
        onHeartChange,
      })
    );

    expect(channelMock.subscribeToKudos).toHaveBeenCalledTimes(1);
    expect(channelMock.subscribeToHearts).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos: vi.fn(),
        onHeartChange: vi.fn(),
      })
    );
    unmount();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mocks = (channelMock as any).__unsubscribeMocks;
    expect(mocks.kudosUnsubscribe).toHaveBeenCalled();
    expect(mocks.heartsUnsubscribe).toHaveBeenCalled();
  });

  it("forwards new kudos id through onNewKudos placeholder card", () => {
    const onNewKudos = vi.fn();
    renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos,
        onHeartChange: vi.fn(),
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (channelMock as any).__triggerKudos({ id: "new-kudos-1" });

    expect(onNewKudos).toHaveBeenCalledTimes(1);
    const arg = onNewKudos.mock.calls[0][0] as { __rawId: string };
    expect(arg.__rawId).toBe("new-kudos-1");
  });

  it("debounces heart events (80ms) before firing", () => {
    const onHeartChange = vi.fn();
    renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos: vi.fn(),
        onHeartChange,
      })
    );

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k1",
        user_id: "u-other",
        weight: 1,
        deleted: false,
      });
    });
    expect(onHeartChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(onHeartChange).toHaveBeenCalledTimes(1);
    expect(onHeartChange).toHaveBeenCalledWith("k1", 1, false);
  });

  it("coalesces rapid heart events to a single callback", () => {
    const onHeartChange = vi.fn();
    renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos: vi.fn(),
        onHeartChange,
      })
    );

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k1",
        user_id: "u",
        weight: 1,
        deleted: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k1",
        user_id: "u",
        weight: 1,
        deleted: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k1",
        user_id: "u",
        weight: 1,
        deleted: false,
      });
    });

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(onHeartChange).toHaveBeenCalledTimes(1);
  });

  it("delta is negative when deleted=true", () => {
    const onHeartChange = vi.fn();
    renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos: vi.fn(),
        onHeartChange,
      })
    );

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k1",
        user_id: "viewer",
        weight: 2,
        deleted: true,
      });
    });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(onHeartChange).toHaveBeenCalledWith("k1", -2, true);
  });

  it("byCurrentUser=true when user_id matches currentUserId", () => {
    const onHeartChange = vi.fn();
    renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos: vi.fn(),
        onHeartChange,
      })
    );

    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k2",
        user_id: "viewer",
        weight: 1,
        deleted: false,
      });
    });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(onHeartChange).toHaveBeenCalledWith("k2", 1, true);
  });

  it("defaults weight=1 when missing", () => {
    const onHeartChange = vi.fn();
    renderHook(() =>
      useRealtimeSubscriptions({
        supabase: {} as never,
        currentUserId: "viewer",
        onNewKudos: vi.fn(),
        onHeartChange,
      })
    );
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (channelMock as any).__triggerHeart({
        kudos_id: "k3",
        user_id: "u",
        weight: undefined,
        deleted: false,
      });
    });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(onHeartChange).toHaveBeenCalledWith("k3", 1, false);
  });
});
