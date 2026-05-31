import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KudosDetailDialog } from "@/app/_components/sun-kudos/kudos-detail-dialog";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

function buildCard(over: Partial<KudosCardData> = {}): KudosCardData {
  return {
    id: "k1",
    sender: { id: "u1", name: "Alice Nguyen", department: "ENG", avatarUrl: null, heroRank: null },
    receiver: { id: "u2", name: "Bob Tran", department: "QA", avatarUrl: null, heroRank: null },
    featureHashtag: "IDOL GIỚI TRẺ",
    hashtags: ["BE A TEAM", "WASSHOI"],
    content: "Cảm ơn bạn rất nhiều!",
    createdAt: "10:00 - 28/05/2026",
    heartCount: 12,
    isHearted: false,
    canLike: true,
    images: [],
    ...over,
  };
}

describe("KudosDetailDialog", () => {
  it("renders nothing when closed (card=null, not loading)", () => {
    const { container } = render(
      <KudosDetailDialog card={null} loading={false} onClose={() => {}} onCopyLink={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a loading spinner while fetching", () => {
    render(<KudosDetailDialog card={null} loading onClose={() => {}} onCopyLink={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Đang tải")).toBeInTheDocument();
  });

  it("renders the kudos content", () => {
    render(<KudosDetailDialog card={buildCard()} onClose={() => {}} onCopyLink={() => {}} />);
    expect(screen.getByText("Alice Nguyen")).toBeInTheDocument();
    expect(screen.getByText("Bob Tran")).toBeInTheDocument();
    expect(screen.getByText("IDOL GIỚI TRẺ")).toBeInTheDocument();
    expect(screen.getByText("Cảm ơn bạn rất nhiều!")).toBeInTheDocument();
    expect(screen.getByText("#BE A TEAM")).toBeInTheDocument();
    expect(screen.getByText("10:00 - 28/05/2026")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<KudosDetailDialog card={buildCard()} onClose={onClose} onCopyLink={() => {}} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the overlay backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<KudosDetailDialog card={buildCard()} onClose={onClose} onCopyLink={() => {}} />);
    fireEvent.mouseDown(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the top-right X (Đóng cửa sổ) is clicked", () => {
    const onClose = vi.fn();
    render(<KudosDetailDialog card={buildCard()} onClose={onClose} onCopyLink={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Đóng cửa sổ" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the footer 'Đóng' button is clicked", () => {
    const onClose = vi.fn();
    render(<KudosDetailDialog card={buildCard()} onClose={onClose} onCopyLink={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onCopyLink with the kudos id", () => {
    const onCopyLink = vi.fn();
    render(<KudosDetailDialog card={buildCard()} onClose={() => {}} onCopyLink={onCopyLink} />);
    fireEvent.click(screen.getByRole("button", { name: "Sao chép liên kết" }));
    expect(onCopyLink).toHaveBeenCalledWith("k1");
  });
});
