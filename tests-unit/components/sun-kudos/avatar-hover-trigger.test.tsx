import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/app/_actions/sun-kudos", () => ({
  getAvatarHoverData: vi.fn(async () => ({
    profile: {
      user_id: "11111111-2222-3333-4444-555555555555",
      full_name_vi: "Test User",
      department_code: null,
      department_name_vi: null,
      employee_code: null,
      title: null,
      avatar_url: null,
      tier: 0,
    },
    received: 0,
    sent: 0,
    hero_rank: null,
  })),
}));

import { AvatarHoverTrigger } from "@/app/_components/sun-kudos/avatar-hover-trigger";

const setHoverable = (hoverable: boolean) => {
  // matchMedia stub — true when query asks for hover-capable input
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: hoverable && q.includes("hover: hover"),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("<AvatarHoverTrigger />", () => {
  it("opens popup after enter delay on hover-capable devices", async () => {
    setHoverable(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AvatarHoverTrigger userId="11111111-2222-3333-4444-555555555555">
        <button type="button">avatar-trigger</button>
      </AvatarHoverTrigger>
    );

    await user.hover(screen.getByText("avatar-trigger"));
    // Popup not visible immediately (enter delay).
    expect(screen.queryByRole("dialog", { name: "Thông tin người dùng" })).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole("dialog", { name: "Thông tin người dùng" })).toBeInTheDocument();
  });

  it("does not open popup on touch / coarse pointer devices", async () => {
    setHoverable(false);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AvatarHoverTrigger userId="11111111-2222-3333-4444-555555555555">
        <span>avatar</span>
      </AvatarHoverTrigger>
    );

    await user.hover(screen.getByText("avatar"));
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("dialog", { name: "Thông tin người dùng" })).toBeNull();
  });

  it("closes popup after leave grace period", async () => {
    setHoverable(true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AvatarHoverTrigger userId="11111111-2222-3333-4444-555555555555">
        <span>avatar</span>
      </AvatarHoverTrigger>
    );

    await user.hover(screen.getByText("avatar"));
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(screen.getByRole("dialog", { name: "Thông tin người dùng" })).toBeInTheDocument();

    await user.unhover(screen.getByText("avatar"));
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(screen.queryByRole("dialog", { name: "Thông tin người dùng" })).toBeNull();
  });
});
