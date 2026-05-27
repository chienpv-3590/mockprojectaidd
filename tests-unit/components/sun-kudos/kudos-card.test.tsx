import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KudosCard } from "@/app/_components/sun-kudos/kudos-card";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

function buildCard(over: Partial<KudosCardData> = {}): KudosCardData {
  return {
    id: "k1",
    sender: { id: "s", name: "Sender Name", department: "ENG", avatarUrl: null },
    receiver: { id: "r", name: "Receiver Name", department: "PM", avatarUrl: null },
    featureHashtag: "IDOL GIỚI TRẺ",
    hashtags: ["A", "B"],
    content: "Cảm ơn rất nhiều",
    createdAt: "08:00 - 26/05/2026",
    heartCount: 12,
    isHearted: false,
    images: [],
    ...over,
  };
}

describe("<KudosCard />", () => {
  it("renders sender, receiver, timestamp, feature hashtag, content", () => {
    render(<KudosCard data={buildCard()} variant="highlight" />);
    expect(screen.getByText("Sender Name")).toBeInTheDocument();
    expect(screen.getByText("Receiver Name")).toBeInTheDocument();
    expect(screen.getByText("08:00 - 26/05/2026")).toBeInTheDocument();
    expect(screen.getByText("IDOL GIỚI TRẺ")).toBeInTheDocument();
    expect(screen.getByText("Cảm ơn rất nhiều")).toBeInTheDocument();
  });

  it("formats heart count using vi-VN locale", () => {
    render(<KudosCard data={buildCard({ heartCount: 1234 })} variant="feed" />);
    expect(screen.getByText("1.234")).toBeInTheDocument();
  });

  it("renders small hashtags with '#' prefix", () => {
    render(<KudosCard data={buildCard({ hashtags: ["Spirit", "Team"] })} variant="feed" />);
    expect(screen.getByText("#Spirit")).toBeInTheDocument();
    expect(screen.getByText("#Team")).toBeInTheDocument();
  });

  it("truncates to first 5 hashtags + ellipsis", () => {
    render(
      <KudosCard
        data={buildCard({ hashtags: ["a", "b", "c", "d", "e", "f", "g"] })}
        variant="feed"
      />
    );
    expect(screen.getByText("#a")).toBeInTheDocument();
    expect(screen.getByText("#e")).toBeInTheDocument();
    expect(screen.queryByText("#f")).not.toBeInTheDocument();
    expect(screen.getByText("…")).toBeInTheDocument();
  });

  it("highlight variant renders 'Xem chi tiết' button", () => {
    render(<KudosCard data={buildCard()} variant="highlight" />);
    expect(
      screen.getByRole("button", { name: /Xem chi tiết/i })
    ).toBeInTheDocument();
  });

  it("feed variant hides 'Xem chi tiết' button", () => {
    render(<KudosCard data={buildCard()} variant="feed" />);
    expect(
      screen.queryByRole("button", { name: /Xem chi tiết/i })
    ).not.toBeInTheDocument();
  });

  it("calls onHeartToggle with id when heart clicked", async () => {
    const user = userEvent.setup();
    const onHeart = vi.fn();
    render(
      <KudosCard data={buildCard({ id: "k7" })} variant="feed" onHeartToggle={onHeart} />
    );
    await user.click(screen.getByRole("button", { name: /thả tim/i }));
    expect(onHeart).toHaveBeenCalledWith("k7");
  });

  it("aria-pressed reflects isHearted", () => {
    render(<KudosCard data={buildCard({ isHearted: true })} variant="feed" />);
    expect(screen.getByRole("button", { name: /bỏ tim/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("calls onCopyLink with id", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <KudosCard data={buildCard({ id: "k8" })} variant="feed" onCopyLink={onCopy} />
    );
    await user.click(screen.getByRole("button", { name: /Copy Link/i }));
    expect(onCopy).toHaveBeenCalledWith("k8");
  });

  it("calls onViewDetail with id (highlight only)", async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    render(
      <KudosCard data={buildCard({ id: "k9" })} variant="highlight" onViewDetail={onView} />
    );
    await user.click(screen.getByRole("button", { name: /Xem chi tiết/i }));
    expect(onView).toHaveBeenCalledWith("k9");
  });

  it("renders ≤5 image thumbnails when images provided", () => {
    const imgs = Array.from({ length: 8 }, (_, i) => ({
      id: `i-${i}`,
      url: `https://x/${i}`,
      alt: `img-${i}`,
    }));
    const { container } = render(
      <KudosCard data={buildCard({ images: imgs })} variant="feed" />
    );
    // Each img has alt; thumbnails limited to 5
    const thumbs = container.querySelectorAll('img[src^="https://x/"]');
    expect(thumbs.length).toBe(5);
  });

  it("hides feature hashtag chip when empty string", () => {
    render(<KudosCard data={buildCard({ featureHashtag: "" })} variant="feed" />);
    expect(screen.queryByText("IDOL GIỚI TRẺ")).not.toBeInTheDocument();
  });

  it("article element acts as semantic root", () => {
    const { container } = render(
      <KudosCard data={buildCard()} variant="feed" />
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    if (article) within(article).getByText("Cảm ơn rất nhiều");
  });
});
