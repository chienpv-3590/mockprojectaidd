import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardCard } from "@/app/_components/home/award-card";
import type { Award } from "@/lib/data/types";

function buildAward(over: Partial<Award> = {}): Award {
  return {
    id: "a1",
    code: "best-tech",
    title_vi: "Giải thưởng Kỹ thuật",
    description_vi: "Mô tả giải thưởng kỹ thuật xuất sắc",
    thumbnail_path: "/home/awards/thumb.png",
    display_order: 1,
    long_description_vi: null,
    quantity_text: null,
    unit_text: null,
    value_text: null,
    value_breakdown: null,
    ...over,
  };
}

describe("<AwardCard />", () => {
  it("renders the award title", () => {
    render(<AwardCard award={buildAward()} />);
    expect(screen.getByText("Giải thưởng Kỹ thuật")).toBeInTheDocument();
  });

  it("renders the award description", () => {
    render(<AwardCard award={buildAward()} />);
    expect(
      screen.getByText("Mô tả giải thưởng kỹ thuật xuất sắc")
    ).toBeInTheDocument();
  });

  it("renders the thumbnail image when thumbnail_path is set", () => {
    render(<AwardCard award={buildAward()} />);
    const thumbImg = screen.getByAltText("Giải thưởng Kỹ thuật");
    expect(thumbImg).toBeInTheDocument();
    expect(thumbImg).toHaveAttribute("src", "/home/awards/thumb.png");
  });

  it("does NOT render a thumbnail img when thumbnail_path is null", () => {
    render(<AwardCard award={buildAward({ thumbnail_path: null })} />);
    expect(
      screen.queryByAltText("Giải thưởng Kỹ thuật")
    ).not.toBeInTheDocument();
  });

  it("renders a Chi tiết link pointing to the correct anchor", () => {
    render(<AwardCard award={buildAward()} />);
    const detailLink = screen.getByRole("link", {
      name: /Chi tiết — Giải thưởng Kỹ thuật/,
    });
    expect(detailLink).toHaveAttribute("href", "/he-thong-giai#best-tech");
  });

  it("title link also points to the correct anchor", () => {
    // Both thumbnail wrapper (via inner img alt) and title link share the
    // title as accessible name. Verify all share the correct href.
    render(<AwardCard award={buildAward()} />);
    const links = screen.getAllByRole("link", {
      name: "Giải thưởng Kỹ thuật",
    });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((l) =>
      expect(l).toHaveAttribute("href", "/he-thong-giai#best-tech")
    );
  });
});
