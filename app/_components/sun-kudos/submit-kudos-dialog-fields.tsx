"use client";

/**
 * submit-kudos-dialog-fields.tsx
 * Field-level sub-components for <SubmitKudosDialog>:
 *   FieldLabel, FieldError, FeatureHashtagSelect, SmallHashtagPicker,
 *   MessageArea, ImageStrip.
 */

import { useRef } from "react";
import Image from "next/image";
import type { Hashtag } from "@/lib/data/types";

export const FM = "var(--font-montserrat), system-ui, sans-serif";

/* ------------------------------------------------------------------ */
/* Shared primitives                                                    */
/* ------------------------------------------------------------------ */

export function FieldLabel({ htmlFor, required, children }: {
  htmlFor?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontFamily: FM,
      fontWeight: 600, fontSize: "14px", lineHeight: "20px",
      color: "rgba(255,255,255,0.85)", marginBottom: "8px" }}>
      {children}
      {required && <span style={{ color: "#FFEA9E", marginLeft: "2px" }}>*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ fontFamily: FM, fontSize: "12px",
      color: "#F87171", marginTop: "4px" }}>{message}</p>
  );
}

/* ------------------------------------------------------------------ */
/* Feature hashtag dropdown (single, required)                         */
/* ------------------------------------------------------------------ */

export function FeatureHashtagSelect({ hashtags, value, onChange, error }: {
  hashtags: Hashtag[]; value: string;
  onChange: (id: string) => void; error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor="feature-hashtag" required>Hạng mục</FieldLabel>
      <select id="feature-hashtag" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", background: "rgba(255,234,158,0.06)",
          border: error ? "1px solid #F87171" : "1px solid #998C5F",
          borderRadius: "8px", padding: "10px 14px", fontFamily: FM, fontSize: "14px",
          color: value ? "#fff" : "rgba(255,255,255,0.4)", outline: "none",
          appearance: "none", cursor: "pointer" }}>
        <option value="" disabled style={{ background: "#0D2233", color: "rgba(255,255,255,0.5)" }}>
          Chọn hạng mục...
        </option>
        {hashtags.map((h) => (
          <option key={h.id} value={h.id} style={{ background: "#0D2233", color: "#fff" }}>
            {h.label_vi}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small hashtag chip multi-select (≤5)                                */
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
      <FieldLabel>
        Tags{" "}
        <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>
          (tối đa 5)
        </span>
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((h) => {
          const active = selected.includes(h.id);
          const atMax = selected.length >= 5 && !active;
          return (
            <button key={h.id} type="button" disabled={atMax} onClick={() => toggle(h.id)}
              style={{ padding: "5px 12px", borderRadius: "99px",
                border: active ? "1px solid #FFEA9E" : "1px solid #2E3940",
                background: active ? "rgba(255,234,158,0.18)" : "transparent",
                fontFamily: FM, fontWeight: 600, fontSize: "13px",
                color: active ? "#FFEA9E" : "rgba(255,255,255,0.55)",
                cursor: atMax ? "not-allowed" : "pointer",
                opacity: atMax ? 0.4 : 1, transition: "all 0.15s" }}>
              #{h.label_vi}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Message textarea with char counter                                  */
/* ------------------------------------------------------------------ */

export function MessageArea({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor="kudos-message" required>Lời cảm ơn</FieldLabel>
      <textarea id="kudos-message" rows={6} maxLength={2000} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Viết lời cảm ơn của bạn..."
        style={{ width: "100%", resize: "vertical", background: "rgba(255,234,158,0.06)",
          border: error ? "1px solid #F87171" : "1px solid #998C5F",
          borderRadius: "8px", padding: "10px 14px", fontFamily: FM,
          fontSize: "14px", lineHeight: "22px", color: "#fff",
          outline: "none", boxSizing: "border-box" }} />
      <div className="flex items-center justify-between" style={{ marginTop: "4px" }}>
        <FieldError message={error} />
        <span style={{ fontFamily: FM, fontSize: "12px", marginLeft: "auto",
          color: value.length > 1900 ? "#F87171" : "rgba(255,255,255,0.35)" }}>
          {value.length}/2000
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image upload strip (≤5 images)                                      */
/* ------------------------------------------------------------------ */

export function ImageStrip({ paths, previews, uploading, onAdd, onRemove, error }: {
  paths: string[]; previews: string[]; uploading: boolean;
  onAdd: (file: File) => void; onRemove: (index: number) => void; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = paths.length < 5 && !uploading;

  return (
    <div>
      <FieldLabel>
        Ảnh đính kèm{" "}
        <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>
          (tối đa 5)
        </span>
      </FieldLabel>
      <div className="flex flex-wrap items-center gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative shrink-0 overflow-hidden rounded-lg"
            style={{ width: 72, height: 72 }}>
            <Image src={src} alt={`Ảnh ${i + 1}`} fill sizes="72px"
              className="object-cover" unoptimized />
            <button type="button" aria-label={`Xóa ảnh ${i + 1}`} onClick={() => onRemove(i)}
              className="absolute right-0 top-0 flex items-center justify-center rounded-bl-lg transition hover:opacity-90"
              style={{ width: 22, height: 22, background: "rgba(0,0,0,0.65)",
                color: "#fff", fontSize: "12px", lineHeight: 1 }}>✕</button>
          </div>
        ))}
        {canAdd && (
          <button type="button" onClick={() => inputRef.current?.click()}
            aria-label="Thêm ảnh"
            className="flex items-center justify-center transition hover:border-[#FFEA9E] hover:text-[#FFEA9E]"
            style={{ width: 72, height: 72, border: "1.5px dashed #998C5F",
              borderRadius: "8px", color: "rgba(255,255,255,0.4)", fontSize: "24px",
              background: "transparent", cursor: "pointer", flexShrink: 0 }}>+</button>
        )}
        {uploading && (
          <span style={{ fontFamily: FM, fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
            Đang tải...
          </span>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ""; }}
          aria-hidden />
      </div>
      <FieldError message={error} />
    </div>
  );
}
