import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardSystem } from "@/app/_components/award-system/award-system";
import type { Award } from "@/lib/data/types";

// AwardMenu uses IntersectionObserver and scroll events — stub for jsdom.
beforeEach(() => {
  // @ts-ignore
  global.IntersectionObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_cb: unknown) {}
  };
  Element.prototype.scrollIntoView = vi.fn();
});

function buildAward(over: Partial<Award> = {}): Award {
  return {
    id: "1",
    code: "top-talent",
    title_vi: "Top Talent",
    description_vi: "Desc",
    thumbnail_path: null,
    display_order: 1,
    long_description_vi: null,
    quantity_text: null,
    unit_text: null,
    value_text: null,
    value_breakdown: null,
    ...over,
  };
}

const THREE_AWARDS: Award[] = [
  buildAward({ id: "1", code: "top-talent", title_vi: "Top Talent", display_order: 1 }),
  buildAward({ id: "2", code: "top-project", title_vi: "Top Project", display_order: 2 }),
  buildAward({ id: "3", code: "best-manager", title_vi: "Best Manager", display_order: 3 }),
];

describe("<AwardSystem />", () => {
  it("renders AwardHero — main h1 is present", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Hệ thống giải thưởng SAA 2025" })
    ).toBeInTheDocument();
  });

  it("renders one AwardDetailCard (h2) per award entry", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    // h2 titles from AwardDetailCard — each award gets one
    const cardTitles = headings.filter((h) =>
      ["Top Talent", "Top Project", "Best Manager"].includes(h.textContent ?? "")
    );
    expect(cardTitles).toHaveLength(THREE_AWARDS.length);
  });

  it("renders the 'Danh sách giải thưởng' section landmark", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    expect(
      screen.getByRole("region", { name: "Danh sách giải thưởng" })
    ).toBeInTheDocument();
  });

  it("renders KudosBanner — 'Sun* Kudos' heading is present", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sun* Kudos" })).toBeInTheDocument();
  });

  it("KudosBanner 'Chi tiết' link points to /sun-kudos", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    const link = screen.getByRole("link", { name: /Chi tiết/i });
    expect(link).toHaveAttribute("href", "/sun-kudos");
  });

  it("renders AwardMenu nav landmark", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    expect(
      screen.getByRole("navigation", { name: "Danh mục giải thưởng" })
    ).toBeInTheDocument();
  });

  it("shows empty-state message when awards array is empty", () => {
    render(<AwardSystem awards={[]} />);
    expect(screen.getByText("Chưa có hạng mục giải thưởng.")).toBeInTheDocument();
  });

  it("sorts cards by display_order ascending regardless of input order", () => {
    const shuffled: Award[] = [
      buildAward({ id: "3", code: "best-manager", title_vi: "Best Manager", display_order: 3 }),
      buildAward({ id: "1", code: "top-talent", title_vi: "Top Talent", display_order: 1 }),
      buildAward({ id: "2", code: "top-project", title_vi: "Top Project", display_order: 2 }),
    ];
    render(<AwardSystem awards={shuffled} />);
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .filter((h) =>
        ["Top Talent", "Top Project", "Best Manager"].includes(h.textContent ?? "")
      );
    expect(headings[0]).toHaveTextContent("Top Talent");
    expect(headings[1]).toHaveTextContent("Top Project");
    expect(headings[2]).toHaveTextContent("Best Manager");
  });

  it("alternates imageLeft: even-index cards get standard layout, odd get reversed", () => {
    render(<AwardSystem awards={THREE_AWARDS} />);
    // Article at index 0 (Top Talent) should NOT have lg:flex-row-reverse
    const article0 = document.querySelector("article#top-talent");
    expect(article0?.className).not.toContain("lg:flex-row-reverse");
    // Article at index 1 (Top Project) SHOULD have lg:flex-row-reverse
    const article1 = document.querySelector("article#top-project");
    expect(article1?.className).toContain("lg:flex-row-reverse");
  });
});
