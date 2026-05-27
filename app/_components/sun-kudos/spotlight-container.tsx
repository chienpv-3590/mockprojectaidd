"use client";

import { useState, useCallback, useRef } from "react";
import { KudosSectionHeader } from "./kudos-section-header";
import { SpotlightWordCloud } from "./spotlight-word-cloud";
import { SpotlightParticles } from "./spotlight-particles";
import type { SpotlightNode } from "@/lib/data/types";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type SpotlightContainerProps = {
  totalKudos: number;
  nodes: SpotlightNode[];
  loading?: boolean;
  highlightedUserId?: string;
  onNodeClick: (node: SpotlightNode) => void;
  onSearchChange: (q: string) => void;
};

/** ~12 skeleton blobs scattered across the canvas area. */
function SkeletonCloud() {
  const blobs: Array<{ w: number; h: number; left: string; top: string; op: number }> = [
    { w: 120, h: 22, left: "8%",  top: "15%", op: 0.5 },
    { w: 80,  h: 18, left: "20%", top: "55%", op: 0.4 },
    { w: 160, h: 28, left: "35%", top: "25%", op: 0.6 },
    { w: 100, h: 20, left: "55%", top: "60%", op: 0.45 },
    { w: 70,  h: 16, left: "65%", top: "18%", op: 0.35 },
    { w: 140, h: 26, left: "72%", top: "42%", op: 0.55 },
    { w: 90,  h: 18, left: "12%", top: "72%", op: 0.4 },
    { w: 110, h: 22, left: "42%", top: "70%", op: 0.5 },
    { w: 60,  h: 14, left: "80%", top: "72%", op: 0.3 },
    { w: 130, h: 24, left: "25%", top: "40%", op: 0.55 },
    { w: 75,  h: 16, left: "58%", top: "32%", op: 0.38 },
    { w: 95,  h: 20, left: "88%", top: "25%", op: 0.42 },
  ];
  return (
    <div className="relative" style={{ minHeight: 420 }} aria-busy="true" aria-label="Đang tải...">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="animate-pulse absolute rounded-full"
          style={{
            width: b.w,
            height: b.h,
            left: b.left,
            top: b.top,
            background: `rgba(255, 234, 158, ${b.op})`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Top bar inside the canvas — per B.7 design:
 *   - Search bar TOP-LEFT
 *   - "388 KUDOS" centered heading (large bold white) TOP-CENTER
 *   - Pan/Zoom is rendered separately at bottom-right (see CanvasPanZoomButton)
 */
function CanvasTopBar({
  totalKudos,
  onSearchChange,
}: {
  totalKudos: number;
  onSearchChange: (q: string) => void;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(q);
      }, 200);
    },
    [onSearchChange]
  );

  return (
    <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-8 pt-6">
      {/* Search bar TOP-LEFT — debounced 200ms */}
      <label
        className="flex items-center gap-2 rounded-full px-4 py-2"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="4.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M10.5 10.5L13.5 13.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Tìm kiếm"
          maxLength={100}
          onChange={handleInput}
          aria-label="Tìm kiếm Sunner"
          className="bg-transparent outline-none w-32"
          style={{ fontFamily: FM, fontSize: "13px", color: "rgba(255,255,255,0.85)" }}
        />
      </label>

      {/* 388 KUDOS — centered heading */}
      <h3
        style={{
          fontFamily: FM,
          fontWeight: 800,
          fontSize: "clamp(24px, 3vw, 36px)",
          lineHeight: "1.1",
          color: "#FFF",
          letterSpacing: "0.5px",
          margin: 0,
        }}
      >
        {totalKudos} KUDOS
      </h3>

      {/* Right spacer to keep title visually centered (matches search width). */}
      <span className="w-32" aria-hidden />
    </div>
  );
}

/** Pan/Zoom toggle — anchored bottom-right corner per B.7 design. */
function CanvasPanZoomButton({
  panningDisabled,
  onTogglePanning,
}: {
  panningDisabled: boolean;
  onTogglePanning: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={panningDisabled ? "Bật chế độ Pan và Zoom" : "Tắt chế độ Pan và Zoom"}
      aria-pressed={!panningDisabled}
      onClick={onTogglePanning}
      className="absolute bottom-6 right-6 z-10 rounded-full p-2 transition hover:bg-white/10"
      style={{
        background: panningDisabled ? "rgba(255,255,255,0.06)" : "rgba(255,234,158,0.18)",
        border: panningDisabled
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid rgba(255,234,158,0.5)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M3 3h5M3 3v5M3 3l5 5M17 3h-5M17 3v5M17 3l-5 5M3 17h5M3 17v-5M3 17l5-5M17 17h-5M17 17v-5M17 17l-5-5"
          stroke={panningDisabled ? "rgba(255,255,255,0.7)" : "#FFEA9E"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/**
 * SpotlightContainer — B.7_Spotlight (node 2940:14174).
 * Outer card: 1157px, border 1px #998C5F, border-radius 47px.
 * Canvas interior: d3-cloud word cloud + react-zoom-pan-pinch.
 */
export function SpotlightContainer({
  totalKudos,
  nodes,
  loading = false,
  highlightedUserId: externalHighlightedUserId,
  onNodeClick: externalOnNodeClick,
  onSearchChange,
}: SpotlightContainerProps) {
  const [panningDisabled, setPanningDisabled] = useState(false);
  const [internalHighlightedUserId, setInternalHighlightedUserId] = useState<string | undefined>();

  // External prop takes precedence over internal toggle state.
  const highlightedUserId = externalHighlightedUserId ?? internalHighlightedUserId;

  const handleTogglePanning = useCallback(() => {
    setPanningDisabled((prev) => !prev);
  }, []);

  const handleNodeClick = useCallback((node: SpotlightNode) => {
    externalOnNodeClick(node);
    setInternalHighlightedUserId((prev) => (prev === node.user_id ? undefined : node.user_id));
  }, [externalOnNodeClick]);

  const isEmpty = !loading && nodes.length === 0;

  return (
    <section aria-labelledby="spotlight-heading" className="px-6 sm:px-10 lg:px-36">
      <div className="mx-auto max-w-[1152px]">
        <KudosSectionHeader title="SPOTLIGHT BOARD" id="spotlight-heading" />
      </div>

      {/* Outer card — per design B.7: polygon mesh constellation + colorful root
          ribbon. Composite of spotlight-ribbon.png + spotlight-mesh.png with
          subtle gold tint overlay matching brand accent. */}
      <div
        className="relative mx-auto mt-10 overflow-hidden"
        style={{
          maxWidth: "1157px",
          border: "1px solid #998C5F",
          borderRadius: "47px",
          background:
            "linear-gradient(0deg, rgba(255,234,158,0.08), rgba(255,234,158,0.08)), url(/home/spotlight-bg.png) center / cover no-repeat, #061E2A",
          minHeight: "548px",
        }}
      >
        {/* Drifting particle constellation — matches saa.sun-asterisk.vn/kudos. */}
        <SpotlightParticles />

        <CanvasTopBar totalKudos={totalKudos} onSearchChange={onSearchChange} />
        <CanvasPanZoomButton
          panningDisabled={panningDisabled}
          onTogglePanning={handleTogglePanning}
        />

        {/* Word-cloud canvas area — sits above the particle layer */}
        <div className="relative z-[1]" style={{ paddingTop: "80px", paddingBottom: nodes.length > 0 ? "48px" : "0" }}>
          {loading ? (
            <SkeletonCloud />
          ) : isEmpty ? (
            <div className="flex items-center justify-center" style={{ minHeight: 420 }}>
              <p
                style={{
                  fontFamily: FM,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Chưa có Kudos nào để hiển thị.
              </p>
            </div>
          ) : (
            <SpotlightWordCloud
              nodes={nodes}
              highlightedUserId={highlightedUserId}
              onNodeClick={handleNodeClick}
              panningDisabled={panningDisabled}
            />
          )}
        </div>

        {/* Activity log — per design B.7 (node 2940:14230): stacked vertical list
            bottom-left, oldest at top fading out, newest at bottom full opacity. */}
        {nodes.length > 0 && !loading && (
          <ActivityLogStack nodes={nodes} />
        )}
      </div>
    </section>
  );
}

/**
 * Activity log — stacked vertical list anchored bottom-left of the canvas.
 * Per B.7 design (node 2940:14230): "HH:MMam/pm Name đã nhận được một Kudos mới".
 * Older entries fade out (top has lowest opacity, bottom = 1.0).
 */
function ActivityLogStack({ nodes }: { nodes: SpotlightNode[] }) {
  const items = [...nodes]
    .filter((n) => n.last_received_at)
    .sort((a, b) => b.last_received_at.localeCompare(a.last_received_at))
    .slice(0, 6)
    .reverse();

  if (items.length === 0) return null;

  // Top of stack = oldest = lowest opacity. Bottom of stack = newest = full.
  const opacityFor = (idx: number, total: number) => {
    if (total <= 1) return 1;
    return 0.25 + (0.75 * idx) / (total - 1);
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, "0")}:${m}${suffix}`;
  };

  return (
    <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-1">
      {items.map((n, i) => (
        <span
          key={`${n.user_id}-${i}`}
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0.1px",
            color: "#FFF",
            opacity: opacityFor(i, items.length),
            whiteSpace: "nowrap",
          }}
        >
          {fmt(n.last_received_at)} {n.name} đã nhận được một Kudos mới
        </span>
      ))}
    </div>
  );
}
