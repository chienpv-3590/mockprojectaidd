"use client";

import Image from "next/image";
import Link from "next/link";
import type { KudosCardData } from "./types";
import { FM, PersonBlock, ArrowIcon, HeartButton } from "./kudos-card-parts";

type KudosCardProps = {
  data: KudosCardData;
  variant: "highlight" | "feed";
  onHeartToggle?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetail?: (id: string) => void;
};

/**
 * KudosCard — shared by HighlightCarousel and KudosFeed.
 *
 * Both cards are cream (#FFF8E1) on the dark #00101A page; they differ only in
 * border, radius, padding, content line-count, and the highlight-only
 * "Xem chi tiết" action.
 *
 *   Highlight (node 2940:13465 B.3_KUDO - Highlight):
 *     border 4px #FFEA9E · radius 16px · padding 24px · content ≤3 lines · "Xem chi tiết"
 *   Feed (node 3127:21871 C.3_KUDO Post):
 *     no border · radius 24px · padding 40px (16px bottom) · content ≤5 lines · tap card to open
 *
 * Sub-components (Avatar, PersonBlock, ArrowIcon, HeartButton) live in
 * kudos-card-parts.tsx to stay under the 200-LOC limit.
 */
export function KudosCard({
  data,
  variant,
  onHeartToggle,
  onCopyLink,
  onViewDetail,
}: KudosCardProps) {
  const isHighlight = variant === "highlight";
  const contentLines = isHighlight ? "line-clamp-3" : "line-clamp-5";
  const cardBorder = isHighlight ? "4px solid #FFEA9E" : "none";
  const cardRadius = isHighlight ? "16px" : "24px";
  const cardPadding = isHighlight ? "24px 24px 16px 24px" : "40px 40px 16px 40px";

  return (
    <article
      className="flex flex-col gap-4"
      style={{
        background: "#FFF8E1",
        border: cardBorder,
        borderRadius: cardRadius,
        padding: cardPadding,
      }}
    >
      {/* Sender → (send icon) → Receiver row (C.3.1/C.3.2/C.3.3).
          Top-aligned so the send icon lines up with the avatars. */}
      <div className="flex items-start justify-between gap-4">
        <PersonBlock user={data.sender} />
        <ArrowIcon />
        <PersonBlock user={data.receiver} />
      </div>

      {/* Divider — Rectangle 14 (1px #FFEA9E) */}
      <div className="h-px w-full" style={{ background: "#FFEA9E" }} aria-hidden />

      {/* Content block (C.3.4 → C.3.7) — 16px gap */}
      <div className="flex flex-col gap-4">
        {/* Timestamp — C.3.4 e.g. "10:00 - 10/30/2025" (#999999) */}
        <p style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px",
            lineHeight: "24px", letterSpacing: "0.5px", color: "#999999" }}>
          {data.createdAt}
        </p>

        {/* Feature hashtag label e.g. "IDOL GIỚI TRẺ" — D.4: centered dark label. */}
        {data.featureHashtag && (
          <p style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px",
            lineHeight: "24px", letterSpacing: "0.5px", color: "#00101A",
            textAlign: "center" }}>
            {data.featureHashtag}
          </p>
        )}

        {/* Message body in the gold framed box (Frame 425) — click navigates to
            the Kudos detail page. Spec C.3.5 + TC 31693bb7. */}
        <Link href={`/sun-kudos/${data.id}`} className="block transition hover:opacity-90">
          <div style={{ background: "rgba(255,234,158,0.40)",
            border: "1px solid #FFEA9E", borderRadius: "12px",
            padding: "16px 24px" }}>
            <p className={contentLines}
              style={{ fontFamily: FM, fontWeight: 700, fontSize: "20px",
                lineHeight: "32px", color: "#00101A", textAlign: "justify" }}>
              {data.content}
            </p>
          </div>
        </Link>

        {/* Image thumbnails — ≤5 (C.3.6) */}
        {data.images && data.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {data.images.slice(0, 5).map((img) => (
              <div key={img.id}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Image src={img.url} alt={img.alt ?? ""} fill sizes="64px"
                  className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}

        {/* Small hashtag row — max 5 then ellipsis (C.3.7, #D4271D 16px/700) */}
        {data.hashtags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {data.hashtags.slice(0, 5).map((tag) => (
              <span key={tag} style={{ fontFamily: FM, fontWeight: 700,
                fontSize: "16px", lineHeight: "24px", letterSpacing: "0.5px",
                color: "#D4271D" }}>
                #{tag}
              </span>
            ))}
            {data.hashtags.length > 5 && (
              <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px",
                color: "#D4271D" }}>…</span>
            )}
          </div>
        )}
      </div>

      {/* Divider — Rectangle 15 (1px #FFEA9E) */}
      <div className="h-px w-full" style={{ background: "#FFEA9E" }} aria-hidden />

      {/* Action bar — C.4_Button */}
      <div className="flex items-center justify-between gap-6">
        <HeartButton
          count={data.heartCount}
          hearted={data.isHearted}
          disabled={data.canLike === false}
          onClick={() => onHeartToggle?.(data.id)}
        />
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Copy Link"
            onClick={() => onCopyLink?.(data.id)}
            className="flex items-center gap-1 rounded px-4 py-3 transition hover:bg-black/5"
            style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px",
              lineHeight: "24px", letterSpacing: "0.15px", color: "#00101A" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6.667 8.667a3.333 3.333 0 0 0 5.04.327l2-2A3.333 3.333 0 1 0 9 2.287L7.84 3.44"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.333 7.333a3.333 3.333 0 0 0-5.04-.327l-2 2a3.333 3.333 0 1 0 4.714 4.706L8.16 12.56"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copy Link
          </button>
          {isHighlight && (
            <button type="button" aria-label="Xem chi tiết kudos này"
              onClick={() => onViewDetail?.(data.id)}
              className="flex items-center gap-1 rounded px-4 py-3 transition hover:bg-black/5"
              style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px",
                lineHeight: "24px", letterSpacing: "0.15px", color: "#00101A" }}>
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
