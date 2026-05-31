"use client";

/**
 * submit-kudos-dialog-fields-legacy.tsx
 * Self-contained legacy field components kept for test backward-compatibility.
 * Tests import FeatureHashtagSelect + MessageArea via submit-kudos-dialog-fields.tsx
 * which re-exports from here. No circular dependency — this file imports only from
 * submit-kudos-dialog-chrome (shared palette/font constants).
 *
 * The dialog itself does NOT render these; they are:
 *   FeatureHashtagSelect — replaced by DanhHieuInput free-text field
 *   MessageArea          — replaced by KudosRichEditor
 */

import type { Hashtag } from "@/lib/data/types";
import { FM, C } from "./submit-kudos-dialog-chrome";

/* ------------------------------------------------------------------ */
/* Shared micro-primitives (self-contained, no import from fields)     */
/* ------------------------------------------------------------------ */

function Label({ htmlFor, required, children }: {
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

function Err({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ fontFamily: FM, fontSize: "12px", color: C.errorRed, marginTop: "4px" }}>
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* FeatureHashtagSelect                                                 */
/* ------------------------------------------------------------------ */

export function FeatureHashtagSelect({
  hashtags, value, onChange, error,
}: {
  hashtags: Hashtag[]; value: string;
  onChange: (id: string) => void; error?: string;
}) {
  return (
    <div>
      <Label htmlFor="feature-hashtag" required>Hạng mục</Label>
      <select
        id="feature-hashtag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.fieldBg,
          border: error ? `1px solid ${C.errorRed}` : `1px solid ${C.border}`,
          borderRadius: "8px", padding: "10px 14px",
          fontFamily: FM, fontSize: "16px", fontWeight: 700, lineHeight: "24px",
          color: value ? C.textPrimary : C.textMuted,
          outline: "none", appearance: "none", cursor: "pointer",
          letterSpacing: "0.15px",
        }}
      >
        <option value="" disabled>Chọn hạng mục...</option>
        {hashtags.map((h) => (
          <option key={h.id} value={h.id}>{h.label_vi}</option>
        ))}
      </select>
      <Err message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MessageArea                                                          */
/* ------------------------------------------------------------------ */

export function MessageArea({
  value, onChange, error,
}: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <Label htmlFor="kudos-message" required>Lời cảm ơn</Label>
      <textarea
        id="kudos-message"
        rows={6}
        maxLength={2000}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Viết lời cảm ơn của bạn..."
        style={{
          width: "100%", resize: "vertical", boxSizing: "border-box",
          background: C.fieldBg,
          border: error ? `1px solid ${C.errorRed}` : `1px solid ${C.border}`,
          borderRadius: "8px", padding: "10px 14px",
          fontFamily: FM, fontSize: "16px", fontWeight: 700, lineHeight: "24px",
          color: C.textPrimary, outline: "none", letterSpacing: "0.15px",
        }}
      />
      <div className="flex items-center justify-between" style={{ marginTop: "4px" }}>
        <Err message={error} />
        <span
          style={{
            fontFamily: FM, fontSize: "12px", marginLeft: "auto",
            color: value.length > 1900 ? C.errorRed : C.textMuted,
          }}
        >
          {value.length}/2000
        </span>
      </div>
    </div>
  );
}
