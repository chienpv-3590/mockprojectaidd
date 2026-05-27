import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "@/app/_components/sun-kudos/_lib/use-toast";

describe("useToast()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts empty", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("show() appends a toast with default variant=success", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.show("Hello");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Hello");
    expect(result.current.toasts[0].variant).toBe("success");
    expect(result.current.toasts[0].id).toMatch(/^toast-\d+$/);
  });

  it("show() with explicit 'error' variant", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.show("Boom", "error");
    });
    expect(result.current.toasts[0].variant).toBe("error");
  });

  it("show() multiple times appends each", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.show("A");
      result.current.show("B");
    });
    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts.map((t) => t.message)).toEqual(["A", "B"]);
  });

  it("auto-dismisses after 3500ms", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.show("Bye");
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("dismiss(id) removes a specific toast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.show("A");
      result.current.show("B");
    });
    const idA = result.current.toasts[0].id;
    act(() => {
      result.current.dismiss(idA);
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("B");
  });

  it("dismiss(unknownId) is a no-op", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.show("A");
    });
    act(() => {
      result.current.dismiss("toast-9999");
    });
    expect(result.current.toasts).toHaveLength(1);
  });

  it("clears pending timers on unmount", () => {
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    const { result, unmount } = renderHook(() => useToast());
    act(() => {
      result.current.show("A");
    });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
