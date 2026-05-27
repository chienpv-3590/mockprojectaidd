"use client";

import { useEffect, useRef, useState } from "react";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  name: string;
  lastReceivedAt: string;
};

type Props = {
  state: TooltipState;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Formats an ISO datetime string as a Vietnamese relative time string.
 * e.g. "5 phút trước", "2 giờ trước", "3 ngày trước".
 * Falls back to "HH:mm - DD/MM/YYYY" for times older than 30 days.
 */
export function formatRelative(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 30) return `${diffDay} ngày trước`;

    // Fallback: absolute timestamp
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    const mo = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm} - ${dd}/${mo}/${yyyy}`;
  } catch {
    return iso;
  }
}

export function SpotlightTooltip({ state, containerRef }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x: state.x, y: state.y });

  useEffect(() => {
    if (!state.visible || !tooltipRef.current || !containerRef.current) return;
    const tip = tooltipRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();
    let x = state.x + 12;
    let y = state.y - 10;
    if (x + tip.width > container.width) x = state.x - tip.width - 12;
    if (y + tip.height > container.height) y = state.y - tip.height - 10;
    setAdjustedPos({ x: Math.max(0, x), y: Math.max(0, y) });
  }, [state.x, state.y, state.visible, containerRef]);

  if (!state.visible) return null;

  const relativeTime = formatRelative(state.lastReceivedAt);

  return (
    <div
      ref={tooltipRef}
      className="pointer-events-none absolute z-50"
      style={{
        left: adjustedPos.x,
        top: adjustedPos.y,
        background: "rgba(6, 16, 24, 0.95)",
        border: "1px solid rgba(153, 140, 95, 0.6)",
        borderRadius: "10px",
        padding: "8px 14px",
        fontFamily: FM,
        whiteSpace: "nowrap",
      }}
    >
      <p style={{ fontWeight: 700, fontSize: "13px", color: "#FFEA9E", margin: 0 }}>
        {state.name}
      </p>
      {relativeTime && (
        <p style={{ fontWeight: 400, fontSize: "11px", color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>
          Đã nhận Kudos lúc {relativeTime}
        </p>
      )}
    </div>
  );
}

export type { TooltipState };
