"use client";

/**
 * kudos-rich-editor.tsx
 * Shell editor component matching the Figma "Nhập kudo" section (Phase 05).
 * Uses a contenteditable div stub — Tiptap will be swapped in Phase 06.
 *
 * Design tokens from node I1612:5057;520:9875 (Nhập kudo).
 * Background: #FFF, border: 1px solid #998C5F, radius toolbar top 8px, content bottom 8px.
 * Toolbar top: border-radius 8px 0 0 / 0 8px 0 0.
 * Content: white, min-height 120px, padding-left 24px.
 */

import Link from "next/link";
import { useRef, useCallback, useEffect } from "react";
import type { UserProfile } from "@/lib/data/types";

const FM = "var(--font-montserrat), system-ui, sans-serif";

/* ------------------------------------------------------------------ */
/* Design tokens from Figma                                             */
/* ------------------------------------------------------------------ */
const BORDER = "1px solid #998C5F";
const BG_FIELD = "#FFF";
const TEXT_PRIMARY = "rgba(0,16,26,1)";
const TEXT_MUTED = "rgba(153,153,153,1)";
const TEXT_RED = "rgba(228,96,96,1)";

/* ------------------------------------------------------------------ */
/* Toolbar icon SVGs (inline, matching Figma icon set)                 */
/* ------------------------------------------------------------------ */

function IconBold() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 3h4.5a3 3 0 0 1 0 6H4V3zm0 6h5a3 3 0 0 1 0 6H4V9z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <line x1="10" y1="3" x2="6" y2="13" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
      <line x1="7" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
      <line x1="5" y1="13" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
    </svg>
  );
}

function IconStrike() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 7c0-2.21 1.79-4 4-4s4 1.79 4 4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 9c0 2.21 1.79 4 4 4s4-1.79 4-4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <line x1="6" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
      <line x1="6" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
      <line x1="6" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" />
      <circle cx="3.5" cy="5" r="1" fill="currentColor" />
      <circle cx="3.5" cy="8" r="1" fill="currentColor" />
      <circle cx="3.5" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6.5 9.5a4.5 4.5 0 0 0 6.364 0l1.768-1.768a4.5 4.5 0 0 0-6.364-6.364l-.884.884"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 6.5a4.5 4.5 0 0 0-6.364 0L1.368 8.268a4.5 4.5 0 0 0 6.364 6.364l.884-.884"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 7h2.5c0 0 .5 3-2.5 3v1c4 0 4.5-4 4.5-4V4H3v3zm7 0h2.5c0 0 .5 3-2.5 3v1c4 0 4.5-4 4.5-4V4H10v3z"
        fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ToolbarButton                                                        */
/* ------------------------------------------------------------------ */

function ToolbarBtn({
  title, active, onClick, children,
}: {
  title: string; active?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, border: "none", outline: "none",
        background: active ? "rgba(0,16,26,0.08)" : "transparent",
        borderRadius: "4px",
        color: active ? TEXT_PRIMARY : "rgba(0,16,26,0.55)",
        cursor: "pointer", transition: "background 0.15s, color 0.15s",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Public types                                                         */
/* ------------------------------------------------------------------ */

export type KudosRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  maxChars?: number;
  /** Phase 06: stub — signature defined for forward-compatibility */
  onMention?: (query: string) => Promise<UserProfile[]>;
  error?: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function KudosRichEditor({
  value, onChange, maxChars = 1000, error,
}: KudosRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  /* Plain-text length derived from innerHTML text content */
  const plainLength = editorRef.current
    ? (editorRef.current.textContent ?? "").length
    : (value.replace(/<[^>]+>/g, "").length);

  const isOverLimit = plainLength > maxChars;

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    /* Treat empty-looking div as empty string */
    onChange(html === "<br>" || html === "<div><br></div>" ? "" : html);
  }, [onChange]);

  /* ---------------------------------------------------------------- */
  /* Sync external value → contenteditable DOM.                        */
  /* A contenteditable cannot be driven like a normal controlled input: */
  /* rewriting innerHTML on every keystroke resets the caret to the     */
  /* start, making typed text appear reversed/jumbled. We therefore     */
  /* write to the DOM only when the incoming `value` actually differs   */
  /* from what is already rendered — i.e. on mount and on programmatic  */
  /* resets (e.g. clearing the form), never during the user's typing.   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const el = editorRef.current;
    if (el && value !== el.innerHTML) el.innerHTML = value;
  }, [value]);

  /* Stub toolbar actions — Phase 06 wires real Tiptap commands */
  const stub = useCallback(() => {/* Phase 06 */ }, []);

  /* Format counter as "n/1.000" with Vietnamese thousand-sep */
  const formatCount = (n: number) =>
    `${n}/${maxChars.toLocaleString("vi-VN")}`;

  const PLACEHOLDER = "Hãy gửi lời cảm ơn và ghi nhận đến đồng đội tại đây nhé!\nVD: Cảm ơn bạn vì tinh thần dẫn dắt và khả năng \"giữ nhịp\" cực kỳ tốt...";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>

      {/* Toolbar — border-radius 8px 8px 0 0 */}
      <div
        style={{
          display: "flex", alignItems: "center", flexWrap: "wrap",
          gap: "2px", padding: "2px 8px",
          background: BG_FIELD,
          border: BORDER,
          borderRadius: "8px 8px 0 0",
          borderBottom: "none",
        }}
      >
        <ToolbarBtn title="Bold" onClick={stub}><IconBold /></ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={stub}><IconItalic /></ToolbarBtn>
        <ToolbarBtn title="Gạch ngang" onClick={stub}><IconStrike /></ToolbarBtn>
        <ToolbarBtn title="Danh sách" onClick={stub}><IconList /></ToolbarBtn>
        <ToolbarBtn title="Liên kết" onClick={stub}><IconLink /></ToolbarBtn>
        <ToolbarBtn title="Trích dẫn" onClick={stub}><IconQuote /></ToolbarBtn>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* "Tiêu chuẩn cộng đồng" link — right-aligned, color #E46060.
            Routes to the General Standards page (umbrella title is "Tiêu
            chuẩn chung" but the kudos-form context refers to its first
            section "Tiêu chuẩn cộng đồng"; both labels point to the same
            page). */}
        <Link
          href="/tieu-chuan-cong-dong"
          style={{
            fontFamily: FM, fontSize: "16px", fontWeight: 700,
            lineHeight: "24px", letterSpacing: "0.15px",
            color: TEXT_RED, textDecoration: "none",
            whiteSpace: "nowrap", padding: "0 8px",
          }}
        >
          Tiêu chuẩn cộng đồng
        </Link>
      </div>

      {/* Editable content area — border-radius 0 0 8px 8px */}
      <div
        style={{
          position: "relative",
          background: BG_FIELD,
          border: error ? "1px solid #E46060" : BORDER,
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          minHeight: "120px",
        }}
      >
        {/* Placeholder — shown when content is empty */}
        {!value && (
          <div
            aria-hidden
            style={{
              position: "absolute", top: 0, left: 0, right: 0,
              padding: "12px 24px",
              fontFamily: FM, fontSize: "16px", fontWeight: 700,
              lineHeight: "24px", letterSpacing: "0.15px",
              color: TEXT_MUTED,
              pointerEvents: "none", whiteSpace: "pre-wrap",
            }}
          >
            {PLACEHOLDER}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          role="textbox"
          aria-multiline
          aria-label="Nội dung Kudos"
          aria-invalid={!!error}
          style={{
            minHeight: "120px",
            padding: "12px 24px",
            fontFamily: FM, fontSize: "16px", fontWeight: 700,
            lineHeight: "24px", letterSpacing: "0.15px",
            color: TEXT_PRIMARY,
            outline: "none",
            wordBreak: "break-word",
          }}
        />
      </div>

      {/* Footer row: hint + char counter */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontFamily: FM, fontSize: "16px", fontWeight: 700,
            lineHeight: "24px", letterSpacing: "0.5px",
            color: TEXT_PRIMARY, flex: 1,
          }}
        >
          Bạn có thể &ldquo;@ + tên&rdquo; để nhắc tới đồng nghiệp khác
        </span>
        <span
          style={{
            fontFamily: FM, fontSize: "16px", fontWeight: 700,
            lineHeight: "24px", letterSpacing: "0.5px",
            color: isOverLimit ? "#E46060" : TEXT_MUTED,
            whiteSpace: "nowrap",
          }}
        >
          {formatCount(plainLength)}
        </span>
      </div>

      {error && (
        <p role="alert" style={{ fontFamily: FM, fontSize: "12px", color: "#E46060", margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
