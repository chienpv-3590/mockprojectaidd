"use client";

import { useCallback, useReducer } from "react";
import type { KudosCardData } from "../types";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

type FeedState = {
  rows: KudosCardData[];
  nextCursor: string | null;
  isLoading: boolean;
};

type FeedAction =
  | { type: "SET_INITIAL"; rows: KudosCardData[]; nextCursor: string | null }
  | { type: "PREPEND"; card: KudosCardData }
  | { type: "APPEND"; rows: KudosCardData[]; nextCursor: string | null }
  | { type: "LOADING" }
  | { type: "TOGGLE_HEART"; kudosId: string; liked: boolean; delta: number }
  | { type: "ROLLBACK_HEART"; kudosId: string; prevLiked: boolean; prevCount: number };

function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case "SET_INITIAL":
      return { rows: action.rows, nextCursor: action.nextCursor, isLoading: false };
    case "PREPEND": {
      // Deduplicate: don't prepend if already present
      const exists = state.rows.some((r) => r.id === action.card.id);
      if (exists) return state;
      return { ...state, rows: [action.card, ...state.rows] };
    }
    case "APPEND":
      return {
        ...state,
        rows: [...state.rows, ...action.rows],
        nextCursor: action.nextCursor,
        isLoading: false,
      };
    case "LOADING":
      return { ...state, isLoading: true };
    case "TOGGLE_HEART":
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.id === action.kudosId
            ? { ...r, isHearted: action.liked, heartCount: r.heartCount + action.delta }
            : r
        ),
      };
    case "ROLLBACK_HEART":
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.id === action.kudosId
            ? { ...r, isHearted: action.prevLiked, heartCount: action.prevCount }
            : r
        ),
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export type UseFeedReturn = {
  feed: FeedState;
  dispatchFeed: React.Dispatch<FeedAction>;
  /** Snapshot a card's heart state before optimistic update. Returns rollback data. */
  snapshotHeart: (kudosId: string) => { prevLiked: boolean; prevCount: number } | null;
};

export function useKudosFeed(initial: {
  rows: KudosCardData[];
  nextCursor: string | null;
}): UseFeedReturn {
  const [feed, dispatchFeed] = useReducer(feedReducer, {
    rows: initial.rows,
    nextCursor: initial.nextCursor,
    isLoading: false,
  });

  const snapshotHeart = useCallback(
    (kudosId: string) => {
      const card = feed.rows.find((r) => r.id === kudosId);
      if (!card) return null;
      return { prevLiked: card.isHearted ?? false, prevCount: card.heartCount };
    },
    [feed.rows]
  );

  return { feed, dispatchFeed, snapshotHeart };
}
