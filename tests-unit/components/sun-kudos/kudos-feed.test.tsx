import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosFeed } from "@/app/_components/sun-kudos/kudos-feed";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

function buildCard(over: Partial<KudosCardData> = {}): KudosCardData {
  return {
    id: "k1",
    sender: { id: "s", name: "Sender" },
    receiver: { id: "r", name: "Receiver" },
    featureHashtag: "F",
    hashtags: [],
    content: "msg",
    createdAt: "08:00 - 26/05/2026",
    heartCount: 0,
    isHearted: false,
    ...over,
  };
}

// Constructor-style spy so `new IntersectionObserver(...)` works.
const observerCtorSpy = vi.fn();

beforeEach(() => {
  observerCtorSpy.mockClear();
  class ObserverStub {
    constructor(cb: unknown) {
      observerCtorSpy(cb);
    }
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).IntersectionObserver = ObserverStub;
});

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (globalThis as any).IntersectionObserver;
});

describe("<KudosFeed />", () => {
  it("shows empty state message when no kudos", () => {
    render(<KudosFeed initialKudos={[]} />);
    expect(screen.getByText("Hiện tại chưa có Kudos nào.")).toBeInTheDocument();
  });

  it("renders one KudosCard per initial item", () => {
    render(
      <KudosFeed
        initialKudos={[
          buildCard({ id: "a", content: "msg-A" }),
          buildCard({ id: "b", content: "msg-B" }),
        ]}
      />
    );
    expect(screen.getByText("msg-A")).toBeInTheDocument();
    expect(screen.getByText("msg-B")).toBeInTheDocument();
  });

  it("uses the 'ALL KUDOS' section header", () => {
    render(<KudosFeed initialKudos={[]} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "ALL KUDOS" })
    ).toBeInTheDocument();
  });

  it("registers an IntersectionObserver when onLoadMore provided", () => {
    const onLoad = vi.fn();
    render(<KudosFeed initialKudos={[buildCard()]} onLoadMore={onLoad} />);
    expect(observerCtorSpy).toHaveBeenCalled();
  });
});
