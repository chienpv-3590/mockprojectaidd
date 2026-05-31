"use client";

/**
 * recipient-picker.tsx
 * Recipient search + select for <SubmitKudosDialog>.
 * Light/cream theme — MoMorph screen JsTvi8KVQA node I1612:5057;520:9871.
 *
 * Behavior (unchanged from dark version):
 *  - Debounced search via sunnerSearch prop
 *  - Select clears query; clear button resets to null
 *  - Click-outside closes dropdown
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/lib/data/types";
import { UserAvatar } from "./user-avatar";
import { FM, C } from "./submit-kudos-dialog-chrome";

type RecipientPickerProps = {
  value: UserProfile | null;
  onChange: (user: UserProfile | null) => void;
  sunnerSearch: (q: string) => Promise<UserProfile[]>;
  error?: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function RecipientPicker({
  value, onChange, sunnerSearch, error,
}: RecipientPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setOpen(false); return; }
    let cancelled = false;
    setLoading(true);
    sunnerSearch(debouncedQuery)
      .then((res) => {
        if (!cancelled) { setResults(res); setOpen(res.length > 0); }
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, sunnerSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = useCallback((user: UserProfile) => {
    onChange(user); setQuery(""); setOpen(false); setResults([]);
  }, [onChange]);

  const clear = useCallback(() => {
    onChange(null); setQuery(""); inputRef.current?.focus();
  }, [onChange]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Label row */}
      <label
        htmlFor="recipient-search"
        style={{
          display: "flex", alignItems: "center", gap: "2px", marginBottom: "8px",
          fontFamily: FM, fontWeight: 700, fontSize: "22px", lineHeight: "28px",
          color: C.textPrimary,
        }}
      >
        Người nhận
        <span style={{ color: C.errorRed, marginLeft: "1px" }}>*</span>
      </label>

      {/* Selected state */}
      {value ? (
        <div
          className="flex items-center gap-3"
          style={{
            background: C.fieldBg,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "8px 12px",
          }}
        >
          <UserAvatar user={value} size={32} />
          <div className="flex flex-1 flex-col" style={{ minWidth: 0 }}>
            <span
              className="truncate"
              style={{
                fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px",
                color: C.textPrimary, letterSpacing: "0.15px",
              }}
            >
              {value.full_name_vi}
            </span>
            {value.department_name_vi && (
              <span
                className="truncate"
                style={{
                  fontFamily: FM, fontWeight: 400, fontSize: "13px",
                  color: C.textMuted,
                }}
              >
                {value.department_name_vi}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label="Xóa người nhận"
            className="shrink-0 transition hover:opacity-60"
            style={{
              color: C.textMuted, background: "none",
              border: "none", cursor: "pointer", fontSize: "16px",
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        /* Search input */
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            id="recipient-search"
            type="text"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tên Sunner..."
            onFocus={() => results.length > 0 && setOpen(true)}
            style={{
              width: "100%", boxSizing: "border-box",
              background: C.fieldBg,
              border: error ? `1px solid ${C.errorRed}` : `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "10px 14px",
              fontFamily: FM, fontSize: "16px", fontWeight: 700,
              lineHeight: "24px", letterSpacing: "0.15px",
              color: C.textPrimary, outline: "none",
            }}
          />
          {loading && (
            <span
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                color: C.textMuted, fontSize: "12px",
              }}
              aria-label="Đang tìm kiếm"
            >
              ⟳
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Kết quả tìm kiếm Sunner"
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            zIndex: 50,
            background: C.fieldBg,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            maxHeight: "220px", overflowY: "auto",
            padding: "4px 0", listStyle: "none", margin: 0,
            boxShadow: "0 4px 16px rgba(0,16,26,0.10)",
          }}
        >
          {results.map((user) => (
            <li key={user.user_id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => select(user)}
                className="flex w-full items-center gap-3 transition hover:bg-black/5"
                style={{ padding: "10px 14px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
              >
                <UserAvatar user={user} size={36} />
                <div className="flex flex-col" style={{ minWidth: 0 }}>
                  <span
                    className="truncate"
                    style={{
                      fontFamily: FM, fontWeight: 700, fontSize: "14px",
                      lineHeight: "20px", color: C.textPrimary,
                    }}
                  >
                    {user.full_name_vi}
                  </span>
                  {user.department_name_vi && (
                    <span
                      className="truncate"
                      style={{
                        fontFamily: FM, fontWeight: 400, fontSize: "12px",
                        color: C.textMuted,
                      }}
                    >
                      {user.department_name_vi}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p
          role="alert"
          style={{
            fontFamily: FM, fontSize: "12px", color: C.errorRed, marginTop: "4px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
