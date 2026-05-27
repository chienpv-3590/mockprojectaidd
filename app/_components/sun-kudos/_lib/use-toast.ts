"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Toast = {
  id: string;
  message: string;
  variant: "success" | "error";
};

const DURATION_MS = 3500;

let _idCounter = 0;
function nextId() {
  return `toast-${++_idCounter}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const show = useCallback(
    (message: string, variant: Toast["variant"] = "success") => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), DURATION_MS);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  // Cleanup on unmount
  useEffect(() => {
    const map = timers.current;
    return () => { for (const t of map.values()) clearTimeout(t); };
  }, []);

  return { toasts, show, dismiss };
}
