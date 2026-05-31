"use client";

/**
 * AvatarHoverTrigger — wraps any element (e.g. an Avatar) to open the
 * `AvatarHoverCard` popup on desktop hover.
 *
 * Behavior:
 *  - Desktop only — gated by `matchMedia('(hover: hover) and (pointer: fine)')`.
 *    Touch / coarse-pointer devices receive the children unchanged.
 *  - 250 ms enter delay so quick mouse-overs don't fire the popup.
 *  - 200 ms leave grace — the popup stays open while the cursor crosses from
 *    the trigger to the popup itself.
 *  - Popup is portalled to <body> and fixed-positioned below the trigger,
 *    flipped above when the viewport doesn't have room.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AvatarHoverCard } from "./avatar-hover-card";

type AvatarHoverTriggerProps = {
  userId: string;
  hideSendButton?: boolean;
  children: ReactNode;
  /** Optional wrapper className — kept light to avoid layout interference. */
  className?: string;
};

const ENTER_DELAY_MS = 250;
const LEAVE_GRACE_MS = 200;
const CARD_WIDTH = 320;
const CARD_OFFSET = 8;

export function AvatarHoverTrigger({
  userId,
  hideSendButton,
  children,
  className,
}: AvatarHoverTriggerProps) {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: "below" | "above" }>({
    top: 0,
    left: 0,
    placement: "below",
  });
  const [supported, setSupported] = useState(false);

  // Detect hover-capable pointer once on mount.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupported(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSupported(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const clearTimers = useCallback(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const computePosition = useCallback(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    // Prefer placing below the avatar; flip above when not enough room.
    const estimatedCardHeight = 280;
    const below = rect.bottom + CARD_OFFSET;
    const wantsAbove = below + estimatedCardHeight > viewportH && rect.top > estimatedCardHeight;
    const top = wantsAbove
      ? Math.max(8, rect.top - CARD_OFFSET - estimatedCardHeight)
      : Math.min(viewportH - estimatedCardHeight - 8, below);
    // Center horizontally on the trigger, then clamp inside the viewport.
    const rawLeft = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    const left = Math.max(8, Math.min(viewportW - CARD_WIDTH - 8, rawLeft));
    setPos({ top, left, placement: wantsAbove ? "above" : "below" });
  }, []);

  // Recompute on scroll/resize while open.
  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    const onScroll = () => computePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, computePosition]);

  const scheduleOpen = useCallback(() => {
    if (!supported) return;
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (open || enterTimerRef.current) return;
    enterTimerRef.current = setTimeout(() => {
      enterTimerRef.current = null;
      setOpen(true);
    }, ENTER_DELAY_MS);
  }, [supported, open]);

  const scheduleClose = useCallback(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (leaveTimerRef.current) return;
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      setOpen(false);
    }, LEAVE_GRACE_MS);
  }, []);

  const closeNow = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers]);

  // Close on Escape for keyboard accessibility.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNow(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeNow]);

  return (
    <>
      <span
        ref={wrapperRef}
        className={className}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>
      {open &&
        supported &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="presentation"
            onMouseEnter={() => {
              if (leaveTimerRef.current) {
                clearTimeout(leaveTimerRef.current);
                leaveTimerRef.current = null;
              }
            }}
            onMouseLeave={scheduleClose}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: CARD_WIDTH,
              zIndex: 60,
            }}
          >
            <AvatarHoverCard
              userId={userId}
              hideSendButton={hideSendButton}
              onAction={closeNow}
            />
          </div>,
          document.body
        )}
    </>
  );
}
