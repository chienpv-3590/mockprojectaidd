import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosTierStars } from "@/app/sun-kudos/_components/kudos-tier-stars";

describe("<KudosTierStars />", () => {
  it("renders 3 filled stars for tier 3", () => {
    render(<KudosTierStars tier={3} />);
    expect(screen.getByText("★★★")).toBeInTheDocument();
  });

  it("renders 2 filled + 1 empty for tier 2", () => {
    render(<KudosTierStars tier={2} />);
    expect(screen.getByText("★★☆")).toBeInTheDocument();
  });

  it("renders 1 filled + 2 empty for tier 1", () => {
    render(<KudosTierStars tier={1} />);
    expect(screen.getByText("★☆☆")).toBeInTheDocument();
  });

  it("renders 3 empty stars for tier 0", () => {
    render(<KudosTierStars tier={0} />);
    expect(screen.getByText("☆☆☆")).toBeInTheDocument();
  });

  it("has correct aria-label reflecting the tier value", () => {
    render(<KudosTierStars tier={2} />);
    expect(screen.getByLabelText("Tier 2")).toBeInTheDocument();
  });

  it("aria-label updates with tier 0", () => {
    render(<KudosTierStars tier={0} />);
    expect(screen.getByLabelText("Tier 0")).toBeInTheDocument();
  });

  it("applies the default font size of 14", () => {
    render(<KudosTierStars tier={1} />);
    const span = screen.getByLabelText("Tier 1");
    expect(span).toHaveStyle({ fontSize: "14px" });
  });

  it("applies a custom size when provided", () => {
    render(<KudosTierStars tier={1} size={20} />);
    const span = screen.getByLabelText("Tier 1");
    expect(span).toHaveStyle({ fontSize: "20px" });
  });

  it("total character count in text is always MAX_TIER (3)", () => {
    for (const tier of [0, 1, 2, 3]) {
      const { unmount } = render(<KudosTierStars tier={tier} />);
      const span = screen.getByLabelText(`Tier ${tier}`);
      expect(span.textContent).toHaveLength(3);
      unmount();
    }
  });
});
