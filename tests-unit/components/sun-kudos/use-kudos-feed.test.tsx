import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useKudosFeed } from "@/app/_components/sun-kudos/_hooks/use-kudos-feed";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

function buildCard(over: Partial<KudosCardData> = {}): KudosCardData {
  return {
    id: "k1",
    sender: { id: "u-s", name: "S" },
    receiver: { id: "u-r", name: "R" },
    featureHashtag: "F",
    hashtags: [],
    content: "msg",
    createdAt: "now",
    heartCount: 0,
    isHearted: false,
    ...over,
  };
}

describe("useKudosFeed()", () => {
  it("seeds initial rows + cursor", () => {
    const { result } = renderHook(() =>
      useKudosFeed({ rows: [buildCard()], nextCursor: "c1" })
    );
    expect(result.current.feed.rows).toHaveLength(1);
    expect(result.current.feed.nextCursor).toBe("c1");
    expect(result.current.feed.isLoading).toBe(false);
  });

  it("PREPEND adds a card at the front", () => {
    const { result } = renderHook(() =>
      useKudosFeed({ rows: [buildCard({ id: "old" })], nextCursor: null })
    );
    act(() => {
      result.current.dispatchFeed({ type: "PREPEND", card: buildCard({ id: "new" }) });
    });
    expect(result.current.feed.rows.map((r) => r.id)).toEqual(["new", "old"]);
  });

  it("PREPEND deduplicates by id (no-op if already present)", () => {
    const { result } = renderHook(() =>
      useKudosFeed({ rows: [buildCard({ id: "k1" })], nextCursor: null })
    );
    act(() => {
      result.current.dispatchFeed({ type: "PREPEND", card: buildCard({ id: "k1" }) });
    });
    expect(result.current.feed.rows).toHaveLength(1);
  });

  it("APPEND adds rows + updates cursor + clears isLoading", () => {
    const { result } = renderHook(() =>
      useKudosFeed({ rows: [buildCard({ id: "a" })], nextCursor: "c1" })
    );
    act(() => {
      result.current.dispatchFeed({ type: "LOADING" });
    });
    expect(result.current.feed.isLoading).toBe(true);
    act(() => {
      result.current.dispatchFeed({
        type: "APPEND",
        rows: [buildCard({ id: "b" }), buildCard({ id: "c" })],
        nextCursor: "c2",
      });
    });
    expect(result.current.feed.rows.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(result.current.feed.nextCursor).toBe("c2");
    expect(result.current.feed.isLoading).toBe(false);
  });

  it("SET_INITIAL replaces rows + cursor", () => {
    const { result } = renderHook(() =>
      useKudosFeed({ rows: [buildCard({ id: "a" })], nextCursor: "c1" })
    );
    act(() => {
      result.current.dispatchFeed({
        type: "SET_INITIAL",
        rows: [buildCard({ id: "x" })],
        nextCursor: null,
      });
    });
    expect(result.current.feed.rows.map((r) => r.id)).toEqual(["x"]);
    expect(result.current.feed.nextCursor).toBeNull();
  });

  it("TOGGLE_HEART flips isHearted + applies delta", () => {
    const { result } = renderHook(() =>
      useKudosFeed({
        rows: [buildCard({ id: "k1", heartCount: 3, isHearted: false })],
        nextCursor: null,
      })
    );
    act(() => {
      result.current.dispatchFeed({
        type: "TOGGLE_HEART",
        kudosId: "k1",
        liked: true,
        delta: 1,
      });
    });
    expect(result.current.feed.rows[0]).toMatchObject({
      isHearted: true,
      heartCount: 4,
    });
  });

  it("ROLLBACK_HEART restores prev state", () => {
    const { result } = renderHook(() =>
      useKudosFeed({
        rows: [buildCard({ id: "k1", heartCount: 3, isHearted: false })],
        nextCursor: null,
      })
    );
    act(() => {
      result.current.dispatchFeed({
        type: "TOGGLE_HEART",
        kudosId: "k1",
        liked: true,
        delta: 1,
      });
    });
    act(() => {
      result.current.dispatchFeed({
        type: "ROLLBACK_HEART",
        kudosId: "k1",
        prevLiked: false,
        prevCount: 3,
      });
    });
    expect(result.current.feed.rows[0]).toMatchObject({
      isHearted: false,
      heartCount: 3,
    });
  });

  it("TOGGLE_HEART only touches matching id", () => {
    const { result } = renderHook(() =>
      useKudosFeed({
        rows: [
          buildCard({ id: "k1", heartCount: 1 }),
          buildCard({ id: "k2", heartCount: 9 }),
        ],
        nextCursor: null,
      })
    );
    act(() => {
      result.current.dispatchFeed({
        type: "TOGGLE_HEART",
        kudosId: "k1",
        liked: true,
        delta: 1,
      });
    });
    expect(result.current.feed.rows[1].heartCount).toBe(9);
  });

  it("snapshotHeart() returns null for unknown id", () => {
    const { result } = renderHook(() =>
      useKudosFeed({ rows: [], nextCursor: null })
    );
    expect(result.current.snapshotHeart("missing")).toBeNull();
  });

  it("snapshotHeart() returns prev state for known id", () => {
    const { result } = renderHook(() =>
      useKudosFeed({
        rows: [buildCard({ id: "k1", heartCount: 7, isHearted: true })],
        nextCursor: null,
      })
    );
    const snap = result.current.snapshotHeart("k1");
    expect(snap).toEqual({ prevLiked: true, prevCount: 7 });
  });
});
