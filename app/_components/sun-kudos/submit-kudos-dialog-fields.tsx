"use client";

/**
 * submit-kudos-dialog-fields.tsx
 * Field-level sub-components for <SubmitKudosDialog>.
 * Light/cream theme — MoMorph screen JsTvi8KVQA.
 *
 * Exports (new Phase 04/05):
 *   FieldLabel, FieldError
 *   DanhHieuInput      — free-text title + helper text
 *   SmallHashtagPicker — chip multi-select (required ≥1, max 5)
 *   ImageStrip         — upload strip (max 5, 80×80)
 *   AnonymousBlock     — checkbox + conditional nickname input
 *
 * Legacy re-exports (tests import these from this path — do NOT remove):
 *   FeatureHashtagSelect, MessageArea  ← from submit-kudos-dialog-fields-legacy
 */

import { useRef } from "react";
import Image from "next/image";
import type { Hashtag } from "@/lib/data/types";
import { FM, C } from "./submit-kudos-dialog-chrome";

/* Legacy re-exports — tests import FeatureHashtagSelect + MessageArea from here */
export { FeatureHashtagSelect, MessageArea } from "./submit-kudos-dialog-fields-legacy";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

export function FieldLabel({ htmlFor, required, children }: {
  htmlFor?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "flex", alignItems: "center", gap: "2px",
        fontFamily: FM, fontWeight: 700, fontSize: "22px", lineHeight: "28px",
        color: C.textPrimary, marginBottom: "8px",
      }}
    >
      {children}
      {required && <span style={{ color: C.errorRed, marginLeft: "1px" }}>*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ fontFamily: FM, fontSize: "12px", color: C.errorRed, marginTop: "4px" }}>
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* DanhHieuInput — free-text title + helper text                       */
/* Placeholder from Figma: "Dành tặng một danh hiệu cho đồng đội"    */
/* Helper from node I1612:5057;1688:10447                              */
/* ------------------------------------------------------------------ */

export function DanhHieuInput({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor="kudos-title" required>Danh hiệu</FieldLabel>
      <input
        id="kudos-title"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={255}
        placeholder="Dành tặng một danh hiệu cho đồng đội"
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.fieldBg,
          border: error ? `1px solid ${C.errorRed}` : `1px solid ${C.border}`,
          borderRadius: "8px", padding: "10px 16px",
          fontFamily: FM, fontSize: "16px", fontWeight: 700, lineHeight: "24px",
          color: C.textPrimary, outline: "none", letterSpacing: "0.15px",
        }}
      />
      <p style={{
        fontFamily: FM, fontSize: "16px", fontWeight: 700, lineHeight: "24px",
        color: C.textMuted, marginTop: "6px", marginBottom: 0,
        letterSpacing: "0.15px", whiteSpace: "pre-line",
      }}>
        {`Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.`}
      </p>
      <FieldError message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SmallHashtagPicker — chip multi-select (required ≥1, max 5)        */
/* Selected chip shows × remove icon (Figma selected state).          */
/* Add-hint chip: "Hashtag / Tối đa 5" (node I1612:5057;662:8910)    */
/* ------------------------------------------------------------------ */

export function SmallHashtagPicker({ hashtags, selected, onChange, error }: {
  hashtags: Hashtag[]; selected: string[];
  onChange: (ids: string[]) => void; error?: string;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else if (selected.length < 5) onChange([...selected, id]);
  };

  return (
    <div>
      <FieldLabel required>Hashtag</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((h) => {
          const active = selected.includes(h.id);
          const atMax = selected.length >= 5 && !active;
          return (
            <button key={h.id} type="button" disabled={atMax} onClick={() => toggle(h.id)}
              className="flex items-center gap-2 transition"
              style={{
                padding: "8px 8px 8px 16px", borderRadius: "8px",
                border: `1px solid ${C.border}`, background: C.fieldBg,
                fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px",
                color: C.textPrimary, cursor: atMax ? "not-allowed" : "pointer",
                opacity: atMax ? 0.45 : 1, letterSpacing: "0.15px",
              }}>
              #{h.label_vi}
              {active && (
                <span aria-hidden style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, borderRadius: "4px",
                  background: "rgba(0,16,26,0.08)", fontSize: "12px", color: C.textPrimary, flexShrink: 0,
                }}>×</span>
              )}
            </button>
          );
        })}
        {selected.length < 5 && (
          <div style={{
            padding: "4px 8px", borderRadius: "8px", border: `1px solid ${C.border}`,
            background: C.fieldBg, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "1px", pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: FM, fontSize: "11px", fontWeight: 700, lineHeight: "16px",
              letterSpacing: "0.5px", color: C.textMuted, textAlign: "center", whiteSpace: "pre",
            }}>{"Hashtag\nTối đa 5"}</span>
          </div>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ImageStrip — upload strip (max 5, 80×80)                           */
/* Design: I1612:5057;520:9896. Add btn: I1612:5057;662:9133          */
/* Red × badge top-right on each image (matches Figma).               */
/* ------------------------------------------------------------------ */

export function ImageStrip({ paths, previews, uploading, onAdd, onRemove, error }: {
  paths: string[]; previews: string[]; uploading: boolean;
  onAdd: (file: File) => void; onRemove: (index: number) => void; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = paths.length < 5 && !uploading;

  return (
    <div>
      <FieldLabel>Image</FieldLabel>
      <div className="flex flex-wrap items-center gap-4">
        {previews.map((src, i) => (
          <div key={i} className="relative shrink-0 overflow-hidden"
            style={{ width: 80, height: 80, borderRadius: "8px", border: `1px solid ${C.border}` }}>
            <Image src={src} alt={`Ảnh ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
            <button type="button" aria-label={`Xóa ảnh ${i + 1}`} onClick={() => onRemove(i)}
              className="absolute right-0 top-0 flex items-center justify-center transition hover:opacity-90"
              style={{
                width: 22, height: 22, borderRadius: "0 0 0 6px",
                background: "rgba(228,96,96,1)", color: "#fff", fontSize: "11px",
                border: "none", cursor: "pointer",
              }}>×</button>
          </div>
        ))}
        {canAdd && (
          <button type="button" onClick={() => inputRef.current?.click()} aria-label="Thêm ảnh"
            className="flex flex-col items-center justify-center gap-1 transition hover:brightness-95"
            style={{
              width: 80, height: 80, border: `1px solid ${C.border}`, borderRadius: "8px",
              background: C.fieldBg, cursor: "pointer", flexShrink: 0, padding: "4px 8px",
            }}>
            <span style={{ fontSize: "18px", color: C.textPrimary, lineHeight: 1 }}>+</span>
            <span style={{
              fontFamily: FM, fontSize: "11px", fontWeight: 700, lineHeight: "16px",
              letterSpacing: "0.5px", color: C.textMuted, textAlign: "center", whiteSpace: "pre",
            }}>{"Image\nTối đa 5"}</span>
          </button>
        )}
        {uploading && (
          <span style={{ fontFamily: FM, fontSize: "12px", color: C.textMuted }}>Đang tải...</span>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ""; }}
          aria-hidden />
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AnonymousBlock — checkbox + conditional nickname input              */
/* Design: I1612:5057;520:14099                                        */
/* ------------------------------------------------------------------ */

export function AnonymousBlock({ isAnonymous, onToggle, nickname, onNicknameChange, nicknameError }: {
  isAnonymous: boolean; onToggle: (v: boolean) => void;
  nickname: string; onNicknameChange: (v: string) => void; nicknameError?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
        <span style={{
          width: 20, height: 20, flexShrink: 0,
          border: `1.5px solid ${C.border}`, borderRadius: "4px",
          background: isAnonymous ? C.goldSolid : C.fieldBg,
          display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s",
        }}>
          {isAnonymous && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6l3 3 5-5" stroke="rgba(0,16,26,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input type="checkbox" checked={isAnonymous} onChange={(e) => onToggle(e.target.checked)} className="sr-only" />
        <span style={{ fontFamily: FM, fontSize: "22px", fontWeight: 700, lineHeight: "28px", color: C.textPrimary }}>
          Gửi lời cám ơn và ghi nhận ẩn danh
        </span>
      </label>
      {isAnonymous && (
        <div>
          <FieldLabel htmlFor="anonymous-nickname" required>Nickname ẩn danh</FieldLabel>
          <input
            id="anonymous-nickname" type="text" value={nickname} maxLength={100}
            onChange={(e) => onNicknameChange(e.target.value)}
            placeholder="Nhập nickname ẩn danh..."
            style={{
              width: "100%", boxSizing: "border-box", background: C.fieldBg,
              border: nicknameError ? `1px solid ${C.errorRed}` : `1px solid ${C.border}`,
              borderRadius: "8px", padding: "10px 16px",
              fontFamily: FM, fontSize: "16px", fontWeight: 700, lineHeight: "24px",
              color: C.textPrimary, outline: "none", letterSpacing: "0.15px",
            }}
          />
          <FieldError message={nicknameError} />
        </div>
      )}
    </div>
  );
}
