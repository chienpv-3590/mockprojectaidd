"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { SpotlightTooltip, type TooltipState } from "./spotlight-tooltip";
import type { SpotlightNode } from "@/lib/data/types";

const FM = "var(--font-montserrat), system-ui, sans-serif";
const CANVAS_W = 1100;
const CANVAS_H = 420;
// Per MoMorph design B.7: dense tiny-name "starfield" aesthetic.
// Designed sizes range ~6.6px–18px; we use 8–18 for readability.
const MIN_SIZE = 8;
const MAX_SIZE = 18;
/** Scale factor for the highlighted node font size. */
const HIGHLIGHT_SCALE = 1.15;

type PlacedWord = {
  text: string;
  x: number;
  y: number;
  rotate: number;
  size: number;
  user_id: string;
  last_received_at: string;
};

type Props = {
  nodes: SpotlightNode[];
  highlightedUserId?: string;
  onNodeClick: (node: SpotlightNode) => void;
  panningDisabled?: boolean;
};

function computeFontSize(count: number, minCount: number, maxCount: number): number {
  if (maxCount === minCount) return (MIN_SIZE + MAX_SIZE) / 2;
  const ratio = (count - minCount) / (maxCount - minCount);
  return Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE));
}

/**
 * Per-word "drift in space" timing. Derived deterministically from the word's
 * index so every name floats on its own amplitude/speed/phase — the cloud
 * breathes organically instead of bobbing in lockstep. Amplitude stays within
 * the d3-cloud padding (6px) to avoid neighbours colliding mid-float.
 */
function floatStyle(i: number): React.CSSProperties {
  const amp = 3 + (i % 4); // 3..6px
  const dur = 4 + ((i * 7) % 5) * 0.6; // 4.0..6.4s
  const delay = -(((i * 13) % 100) / 100) * dur; // spread starting phase
  return {
    animationName: "kudos-spotlight-float",
    animationDuration: `${dur}s`,
    animationDelay: `${delay}s`,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    ["--float-amp" as string]: `${-amp}px`,
  };
}

export function SpotlightWordCloud({
  nodes,
  highlightedUserId,
  onNodeClick,
  panningDisabled = false,
}: Props) {
  const [placed, setPlaced] = useState<PlacedWord[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, name: "", lastReceivedAt: "",
  });

  const counts = useMemo(() => nodes.map((n) => n.received_count), [nodes]);
  const minCount = useMemo(() => (counts.length ? Math.min(...counts) : 0), [counts]);
  const maxCount = useMemo(() => (counts.length ? Math.max(...counts) : 1), [counts]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, SpotlightNode>();
    for (const n of nodes) m.set(n.user_id, n);
    return m;
  }, [nodes]);

  useEffect(() => {
    if (nodes.length === 0) {
      setPlaced([]);
      return;
    }
    setLoading(true);

    let cancelled = false;
    (async () => {
      const cloudModule = await import("d3-cloud");
      // d3-cloud exports a default function (CJS interop via Next.js bundler)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cloud = (cloudModule as any).default ?? cloudModule;

      if (cancelled) return;

      const words = nodes.map((n) => ({
        text: n.name,
        size: computeFontSize(n.received_count, minCount, maxCount),
        user_id: n.user_id,
        last_received_at: n.last_received_at,
      }));

      cloud()
        .size([CANVAS_W, CANVAS_H])
        .words(words)
        .padding(6)
        // Per B.7 design: all names render horizontally — no vertical rotation.
        .rotate(() => 0)
        .font("Montserrat")
        .fontSize((d: { size?: number }) => d.size ?? MIN_SIZE)
        .spiral("archimedean")
        .on("end", (result: PlacedWord[]) => {
          if (!cancelled) {
            setPlaced(result);
            setLoading(false);
          }
        })
        .start();
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [nodes, minCount, maxCount]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGTextElement>, pw: PlacedWord) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        name: pw.text,
        lastReceivedAt: pw.last_received_at,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const handleClick = useCallback(
    (pw: PlacedWord) => {
      const node = nodeMap.get(pw.user_id);
      if (node) onNodeClick(node);
    },
    [nodeMap, onNodeClick]
  );

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: CANVAS_H }}>
        <p style={{ fontFamily: FM, fontSize: "15px", color: "rgba(255,255,255,0.3)" }}>
          Chưa có dữ liệu
        </p>
      </div>
    );
  }

  const hasHighlight = highlightedUserId !== undefined && highlightedUserId !== "";

  return (
    <div ref={containerRef} className="relative overflow-hidden" style={{ minHeight: CANVAS_H }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="animate-spin rounded-full border-2"
            style={{ width: 32, height: 32, borderColor: "rgba(255,234,158,0.3)", borderTopColor: "#FFEA9E" }}
          />
        </div>
      )}

      {!loading && placed.length > 0 && (
        <TransformWrapper
          minScale={0.5}
          maxScale={4}
          initialScale={1}
          panning={{ disabled: panningDisabled }}
          wheel={{ disabled: false }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: CANVAS_H, overflow: "hidden" }}
            contentStyle={{ width: CANVAS_W, height: CANVAS_H }}
          >
            <svg
              width={CANVAS_W}
              height={CANVAS_H}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              style={{ overflow: "visible" }}
            >
              <g transform={`translate(${CANVAS_W / 2},${CANVAS_H / 2})`}>
                {placed.map((pw, i) => {
                  const isHighlighted = pw.user_id === highlightedUserId;
                  // Per B.7 design: word-cloud names render in WHITE; only the
                  // highlighted (searched/clicked) node turns red.
                  const fill = isHighlighted ? "#FF5252" : "#FFFFFF";
                  // When a node is highlighted: that node opacity 1 + 15% larger;
                  // all others dim to 0.35. When no highlight active, all at 0.75.
                  const opacity = hasHighlight ? (isHighlighted ? 1 : 0.35) : 0.75;
                  const fontSize = isHighlighted
                    ? Math.round(pw.size * HIGHLIGHT_SCALE)
                    : pw.size;
                  return (
                    // Wrapper carries the gentle float so it composes with the
                    // text's own rotate attribute without clobbering it.
                    <g key={pw.user_id} className="kudos-spotlight-word" style={floatStyle(i)}>
                      <text
                        x={pw.x}
                        y={pw.y}
                        fontSize={fontSize}
                        fontFamily="Montserrat, system-ui, sans-serif"
                        fontWeight={700}
                        fill={fill}
                        opacity={opacity}
                        textAnchor="middle"
                        transform={`rotate(${pw.rotate ?? 0},${pw.x},${pw.y})`}
                        style={{ cursor: "pointer", userSelect: "none", transition: "opacity 0.2s, font-size 0.2s" }}
                        onMouseMove={(e) => handleMouseMove(e, pw)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(pw)}
                      >
                        {pw.text}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </TransformComponent>
        </TransformWrapper>
      )}

      <SpotlightTooltip state={tooltip} containerRef={containerRef} />
    </div>
  );
}
