import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosSidebar } from "@/app/_components/sun-kudos/kudos-sidebar";
import type {
  SidebarStats,
  SecretBoxRecipient,
} from "@/app/_components/sun-kudos/types";

const stats: SidebarStats = {
  kudosReceived: 12,
  kudosSent: 3,
  hearts: 1234,
  secretBoxOpened: 2,
  secretBoxPending: 5,
};

function buildRecipient(over: Partial<SecretBoxRecipient> = {}): SecretBoxRecipient {
  return {
    id: "u1",
    name: "Alice",
    avatarUrl: null,
    rewardLabel: "Voucher 100k",
    ...over,
  };
}

describe("<KudosSidebar />", () => {
  it("renders all 5 stat labels", () => {
    render(<KudosSidebar stats={stats} recipients={[]} />);
    expect(screen.getByText("Số Kudos bạn nhận được:")).toBeInTheDocument();
    expect(screen.getByText("Số Kudos bạn đã gửi:")).toBeInTheDocument();
    expect(screen.getByText("Số tim bạn nhận được:")).toBeInTheDocument();
    expect(screen.getByText("Số Secret Box bạn đã mở:")).toBeInTheDocument();
    expect(screen.getByText("Số Secret Box chưa mở:")).toBeInTheDocument();
  });

  it("formats large numbers with vi-VN locale", () => {
    render(<KudosSidebar stats={stats} recipients={[]} />);
    expect(screen.getByText("1.234")).toBeInTheDocument();
  });

  it("renders 'Mở Secret Box' CTA + fires callback", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<KudosSidebar stats={stats} recipients={[]} onOpenSecretBox={onOpen} />);
    const btn = screen.getByRole("button", { name: "Mở Secret Box" });
    await user.click(btn);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders up to 10 recipients only", () => {
    const recipients = Array.from({ length: 15 }, (_, i) =>
      buildRecipient({ id: `u${i}`, name: `User ${i}` })
    );
    render(<KudosSidebar stats={stats} recipients={recipients} />);
    // First 10 should be rendered
    expect(screen.getByText("User 0")).toBeInTheDocument();
    expect(screen.getByText("User 9")).toBeInTheDocument();
    expect(screen.queryByText("User 10")).not.toBeInTheDocument();
  });

  it("renders the leaderboard heading and recipient names (no rank prefix)", () => {
    // Design 2940:13513 — gold centered title, recipients listed without ranks.
    const r = [buildRecipient({ id: "a" }), buildRecipient({ id: "b", name: "Bob" })];
    render(<KudosSidebar stats={stats} recipients={r} />);
    expect(screen.getByText("10 SUNNER NHẬN QUÀ MỚI NHẤT")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders avatar image if avatarUrl set, else initials", () => {
    render(
      <KudosSidebar
        stats={stats}
        recipients={[
          buildRecipient({ id: "a", name: "Alice Smith", avatarUrl: "https://x/a.png" }),
          buildRecipient({ id: "b", name: "Bob Jones", avatarUrl: null }),
        ]}
      />
    );
    expect(screen.getByAltText("Alice Smith")).toBeInTheDocument();
    // Bob initials: "B J"
    expect(screen.getByText("BJ")).toBeInTheDocument();
  });

  it("renders reward label", () => {
    render(
      <KudosSidebar
        stats={stats}
        recipients={[buildRecipient({ rewardLabel: "Coffee voucher" })]}
      />
    );
    expect(screen.getByText("Coffee voucher")).toBeInTheDocument();
  });

  it("aside has aria-label", () => {
    render(<KudosSidebar stats={stats} recipients={[]} />);
    expect(
      screen.getByRole("complementary", { name: "Thống kê và phần thưởng" })
    ).toBeInTheDocument();
  });
});
