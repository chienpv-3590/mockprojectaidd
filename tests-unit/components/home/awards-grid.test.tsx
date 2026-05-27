import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardsGrid } from "@/app/_components/home/awards-grid";
import type { Award } from "@/lib/data/types";

function buildAward(id: string, title: string): Award {
  return {
    id,
    code: `code-${id}`,
    title_vi: title,
    description_vi: `Mô tả ${title}`,
    thumbnail_path: null,
    display_order: 1,
    long_description_vi: null,
    quantity_text: null,
    unit_text: null,
    value_text: null,
    value_breakdown: null,
  };
}

describe("<AwardsGrid />", () => {
  it("renders the section heading", () => {
    render(<AwardsGrid awards={[]} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Hệ thống giải thưởng" })
    ).toBeInTheDocument();
  });

  it("renders the subtitle label", () => {
    render(<AwardsGrid awards={[]} />);
    expect(screen.getByText("Sun* annual awards 2025")).toBeInTheDocument();
  });

  it("shows empty state message when awards array is empty", () => {
    render(<AwardsGrid awards={[]} />);
    expect(
      screen.getByText("Chưa có hạng mục giải thưởng.")
    ).toBeInTheDocument();
  });

  it("renders one AwardCard per award in the array", () => {
    const awards = [
      buildAward("1", "Giải A"),
      buildAward("2", "Giải B"),
      buildAward("3", "Giải C"),
    ];
    render(<AwardsGrid awards={awards} />);
    expect(screen.getByText("Giải A")).toBeInTheDocument();
    expect(screen.getByText("Giải B")).toBeInTheDocument();
    expect(screen.getByText("Giải C")).toBeInTheDocument();
  });

  it("does NOT show empty state when awards are present", () => {
    render(<AwardsGrid awards={[buildAward("1", "Giải A")]} />);
    expect(
      screen.queryByText("Chưa có hạng mục giải thưởng.")
    ).not.toBeInTheDocument();
  });
});
