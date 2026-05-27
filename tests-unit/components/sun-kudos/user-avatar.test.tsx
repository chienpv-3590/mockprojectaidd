import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatar } from "@/app/_components/sun-kudos/user-avatar";
import type { UserProfile } from "@/lib/data/types";

function buildUser(over: Partial<UserProfile> = {}): UserProfile {
  return {
    user_id: "u1",
    full_name_vi: "Nguyễn Văn A",
    department_code: null,
    department_name_vi: null,
    employee_code: null,
    title: null,
    avatar_url: null,
    tier: 0,
    ...over,
  };
}

describe("<UserAvatar />", () => {
  it("renders <img> when avatar_url is set", () => {
    render(<UserAvatar user={buildUser({ avatar_url: "https://x/a.png" })} size={64} />);
    const img = screen.getByAltText("Nguyễn Văn A");
    expect(img).toHaveAttribute("src", "https://x/a.png");
  });

  it("renders initials fallback when avatar_url null", () => {
    render(<UserAvatar user={buildUser()} size={64} />);
    // last 2 words: "Văn A" → V A
    expect(screen.getByText("VA")).toBeInTheDocument();
  });

  it("initials handle single-word name", () => {
    render(<UserAvatar user={buildUser({ full_name_vi: "Alice" })} size={32} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
