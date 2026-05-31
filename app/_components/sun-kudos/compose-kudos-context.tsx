"use client";

/**
 * Bubble-up bus for "Gửi KUDO" CTA from avatar hover cards into the page-level
 * SubmitKudosDialog without prop-drilling through KudosFeed / HighlightCarousel /
 * spotlight nodes.
 *
 * Provider lives on the Live Board page (which owns the dialog state).
 * On pages WITHOUT a provider (e.g. the standalone /sun-kudos/[id] detail page),
 * the hover card falls back to navigating ?compose=<userId> — the live-board
 * page already supports this deep-link.
 */
import { createContext, useContext } from "react";
import type { UserProfile } from "@/lib/data/types";

type ComposeKudosContextValue = {
  /** Open the submit-kudos dialog pre-filled with `recipient`. */
  openCompose: (recipient: UserProfile) => void;
};

const ComposeKudosContext = createContext<ComposeKudosContextValue | null>(null);

export const ComposeKudosProvider = ComposeKudosContext.Provider;

/** Returns the compose function, or null when no provider mounted above. */
export function useOptionalComposeKudos(): ComposeKudosContextValue["openCompose"] | null {
  const ctx = useContext(ComposeKudosContext);
  return ctx?.openCompose ?? null;
}
