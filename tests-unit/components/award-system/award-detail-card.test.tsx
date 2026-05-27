import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { AwardDetailCard } from "@/app/_components/award-system/award-detail-card";
import type { Award } from "@/lib/data/types";

function buildAward(over: Partial<Award> = {}): Award {
  return {
    id: "1",
    code: "top-talent",
    title_vi: "Top Talent",
    description_vi: "Mô tả ngắn",
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

describe("<AwardDetailCard />", () => {
  it("renders the award title in the heading", () => {
    render(<AwardDetailCard award={buildAward()} imageLeft />);
    expect(screen.getByRole("heading", { level: 2, name: "Top Talent" })).toBeInTheDocument();
  });

  it("renders the award article with id equal to award.code", () => {
    const { container } = render(<AwardDetailCard award={buildAward({ code: "mvp" })} imageLeft />);
    const article = container.querySelector("article#mvp");
    expect(article).not.toBeNull();
  });

  it("renders thumbnail image with award title as alt text", () => {
    render(<AwardDetailCard award={buildAward({ title_vi: "MVP Award" })} imageLeft />);
    // The per-award wordmark image carries the title as alt
    expect(screen.getByAltText("MVP Award")).toBeInTheDocument();
  });

  it("renders long_description_vi when provided (not short description)", () => {
    render(
      <AwardDetailCard
        award={buildAward({
          long_description_vi: "Mô tả dài đây",
          description_vi: "Mô tả ngắn",
        })}
        imageLeft
      />
    );
    expect(screen.getByText("Mô tả dài đây")).toBeInTheDocument();
    expect(screen.queryByText("Mô tả ngắn")).not.toBeInTheDocument();
  });

  it("falls back to description_vi when long_description_vi is null", () => {
    render(
      <AwardDetailCard
        award={buildAward({
          long_description_vi: null,
          description_vi: "Chỉ có mô tả ngắn",
        })}
        imageLeft
      />
    );
    expect(screen.getByText("Chỉ có mô tả ngắn")).toBeInTheDocument();
  });

  it("renders 'Số lượng giải thưởng:' with quantity and unit when provided", () => {
    render(
      <AwardDetailCard
        award={buildAward({ quantity_text: "01", unit_text: "giải" })}
        imageLeft
      />
    );
    expect(screen.getByText("Số lượng giải thưởng:")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("giải")).toBeInTheDocument();
  });

  it("hides quantity row when both quantity_text and unit_text are null", () => {
    render(
      <AwardDetailCard
        award={buildAward({ quantity_text: null, unit_text: null })}
        imageLeft
      />
    );
    expect(screen.queryByText("Số lượng giải thưởng:")).not.toBeInTheDocument();
  });

  it("renders 'Giá trị giải thưởng:' and value_text when no breakdown provided", () => {
    render(
      <AwardDetailCard
        award={buildAward({ value_text: "50.000.000 VNĐ", value_breakdown: null })}
        imageLeft
      />
    );
    expect(screen.getByText("Giá trị giải thưởng:")).toBeInTheDocument();
    expect(screen.getByText("50.000.000 VNĐ")).toBeInTheDocument();
  });

  it("renders value_breakdown entries when provided, with 'Hoặc' divider between multiple entries", () => {
    render(
      <AwardDetailCard
        award={buildAward({
          value_breakdown: [
            { amount_text: "30.000.000 VNĐ", label: "cho mỗi giải" },
            { amount_text: "10.000.000 VNĐ", label: null },
          ],
          value_text: null,
        })}
        imageLeft
      />
    );
    // Both values present
    expect(screen.getByText("30.000.000 VNĐ")).toBeInTheDocument();
    expect(screen.getByText("10.000.000 VNĐ")).toBeInTheDocument();
    // Sub-label of first entry
    expect(screen.getByText("cho mỗi giải")).toBeInTheDocument();
    // Divider only appears between entries (i > 0)
    expect(screen.getByText("Hoặc")).toBeInTheDocument();
    // 'Giá trị giải thưởng:' appears once per entry
    expect(screen.getAllByText("Giá trị giải thưởng:")).toHaveLength(2);
  });

  it("does not render 'Hoặc' when only one breakdown entry", () => {
    render(
      <AwardDetailCard
        award={buildAward({
          value_breakdown: [{ amount_text: "20.000.000 VNĐ", label: "per award" }],
          value_text: null,
        })}
        imageLeft
      />
    );
    expect(screen.queryByText("Hoặc")).not.toBeInTheDocument();
  });

  it("uses thumbnail_path as image src when provided", () => {
    render(
      <AwardDetailCard
        award={buildAward({
          thumbnail_path: "/custom/path/award.png",
          title_vi: "Custom Award",
        })}
        imageLeft
      />
    );
    const img = screen.getByAltText("Custom Award") as HTMLImageElement;
    expect(img.src).toContain("/custom/path/award.png");
  });

  it("resolves known code to award image when thumbnail_path is null", () => {
    render(
      <AwardDetailCard
        award={buildAward({
          code: "signature-creator",
          title_vi: "Signature Creator",
          thumbnail_path: null,
        })}
        imageLeft
      />
    );
    const img = screen.getByAltText("Signature Creator") as HTMLImageElement;
    expect(img.src).toContain("signature-2025-creator.png");
  });

  it("imageLeft=false reverses layout via lg:flex-row-reverse class", () => {
    const { container } = render(
      <AwardDetailCard award={buildAward()} imageLeft={false} />
    );
    const article = container.querySelector("article");
    expect(article?.className).toContain("lg:flex-row-reverse");
  });

  it("imageLeft=true does not add lg:flex-row-reverse class", () => {
    const { container } = render(
      <AwardDetailCard award={buildAward()} imageLeft />
    );
    const article = container.querySelector("article");
    expect(article?.className).not.toContain("lg:flex-row-reverse");
  });
});
