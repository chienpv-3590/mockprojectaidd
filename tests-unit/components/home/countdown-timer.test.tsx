import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountdownTimer } from "@/app/_components/home/countdown-timer";

describe("<CountdownTimer />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders DAYS, HOURS, MINUTES labels", () => {
    render(<CountdownTimer eventDateIso={null} />);
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getByText("HOURS")).toBeInTheDocument();
    expect(screen.getByText("MINUTES")).toBeInTheDocument();
  });

  it("renders zeros when eventDateIso is null", () => {
    render(<CountdownTimer eventDateIso={null} />);
    // Each zero is split into two "0" digit spans — at least one exists.
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it("renders zeros when eventDateIso is in the past", () => {
    render(<CountdownTimer eventDateIso="2000-01-01T00:00:00.000Z" />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
    // Labels still visible.
    expect(screen.getByText("DAYS")).toBeInTheDocument();
  });

  it("renders non-zero digits for a future date", () => {
    // Pin Date.now() to a known point: 2025-06-01T00:00:00Z
    const now = new Date("2025-06-01T00:00:00.000Z").getTime();
    vi.setSystemTime(now);

    // Event 5 days 2 hours 30 minutes later
    const future = new Date(now + 5 * 86_400_000 + 2 * 3_600_000 + 30 * 60_000);
    render(<CountdownTimer eventDateIso={future.toISOString()} />);

    // Days tile should show "05" — digits "0" and "5"
    expect(screen.getByText("5")).toBeInTheDocument();
    // Hours tile should show "02" — digit "2"
    expect(screen.getByText("2")).toBeInTheDocument();
    // Minutes tile should show "30" — digits "3" and "0"
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("updates displayed values after one minute tick", () => {
    const now = new Date("2025-06-01T00:00:00.000Z").getTime();
    vi.setSystemTime(now);

    // 3 minutes in the future — will show "00" days, "00" hours, "03" mins
    const future = new Date(now + 3 * 60_000);
    render(<CountdownTimer eventDateIso={future.toISOString()} />);

    // Initially "3" is visible for minutes
    expect(screen.getByText("3")).toBeInTheDocument();

    // Advance one minute — 2 minutes remain
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // --- "Coming soon" prelaunch teaser (spec B1.2 / test cases ID-13, 41-43) ---

  it("shows the 'Coming soon' teaser when the date is null (prelaunch fallback)", () => {
    render(<CountdownTimer eventDateIso={null} />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("shows the 'Coming soon' teaser before the event starts (ID-13/ID-43)", () => {
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z").getTime());
    render(<CountdownTimer eventDateIso="2026-12-31T12:00:00.000Z" />);
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("hides the 'Coming soon' teaser once the event start is reached, keeping 00 tiles (ID-41/ID-42)", () => {
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z").getTime());
    // Event start already in the past relative to the pinned "now".
    render(<CountdownTimer eventDateIso="2026-01-01T00:00:00.000Z" />);
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    // Tiles remain at 00 — labels and zeros still present.
    expect(screen.getByText("DAYS")).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(1);
  });

  it("stays in prelaunch (teaser shown) for an invalid date without crashing (ID-60)", () => {
    expect(() =>
      render(<CountdownTimer eventDateIso="not-a-real-date" />)
    ).not.toThrow();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("clears the interval on unmount (no timer leak)", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = render(
      <CountdownTimer eventDateIso="2099-01-01T00:00:00.000Z" />
    );
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
