"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UserProfile } from "@/lib/data/types";
import { UserAvatar } from "./user-avatar";

const FM = "var(--font-montserrat), system-ui, sans-serif";

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

export function RecipientPicker({ value, onChange, sunnerSearch, error }: RecipientPickerProps) {
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
      .then((res) => { if (!cancelled) { setResults(res); setOpen(res.length > 0); } })
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

  const inputBorder = error ? "1px solid #F87171" : "1px solid #998C5F";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <label htmlFor="recipient-search" style={{ display: "block", fontFamily: FM,
        fontWeight: 600, fontSize: "14px", color: "rgba(255,255,255,0.85)", marginBottom: "8px" }}>
        Gửi đến <span style={{ color: "#FFEA9E" }}>*</span>
      </label>

      {value ? (
        <div className="flex items-center gap-3" style={{ background: "rgba(255,234,158,0.12)",
          border: "1px solid #998C5F", borderRadius: "8px", padding: "8px 12px" }}>
          <UserAvatar user={value} size={32} />
          <div className="flex flex-1 flex-col" style={{ minWidth: 0 }}>
            <span className="truncate" style={{ fontFamily: FM, fontWeight: 600,
              fontSize: "14px", color: "#fff" }}>{value.full_name_vi}</span>
            {value.department_name_vi && (
              <span className="truncate" style={{ fontFamily: FM, fontWeight: 400,
                fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>{value.department_name_vi}</span>
            )}
          </div>
          <button type="button" onClick={clear} aria-label="Xóa người nhận"
            className="shrink-0 transition hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.6)" }}>✕</button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <input ref={inputRef} id="recipient-search" type="text" autoComplete="off"
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tên Sunner..."
            onFocus={() => results.length > 0 && setOpen(true)}
            style={{ width: "100%", background: "rgba(255,234,158,0.06)", border: inputBorder,
              borderRadius: "8px", padding: "10px 14px", fontFamily: FM, fontSize: "14px",
              color: "#fff", outline: "none", boxSizing: "border-box" }} />
          {loading && (
            <span style={{ position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
              aria-label="Đang tìm kiếm">⟳</span>
          )}
        </div>
      )}

      {open && (
        <ul role="listbox" aria-label="Kết quả tìm kiếm Sunner"
          style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            zIndex: 50, background: "#0D2233", border: "1px solid #2E3940",
            borderRadius: "8px", maxHeight: "220px", overflowY: "auto",
            padding: "4px 0", listStyle: "none", margin: 0 }}>
          {results.map((user) => (
            <li key={user.user_id} role="option" aria-selected={false}>
              <button type="button" onClick={() => select(user)}
                className="flex w-full items-center gap-3 transition hover:bg-[rgba(255,234,158,0.08)]"
                style={{ padding: "10px 14px", textAlign: "left" }}>
                <UserAvatar user={user} size={36} />
                <div className="flex flex-col" style={{ minWidth: 0 }}>
                  <span className="truncate" style={{ fontFamily: FM, fontWeight: 600,
                    fontSize: "14px", color: "#fff" }}>{user.full_name_vi}</span>
                  {user.department_name_vi && (
                    <span className="truncate" style={{ fontFamily: FM, fontWeight: 400,
                      fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{user.department_name_vi}</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" style={{ fontFamily: FM, fontSize: "12px",
          color: "#F87171", marginTop: "4px" }}>{error}</p>
      )}
    </div>
  );
}
