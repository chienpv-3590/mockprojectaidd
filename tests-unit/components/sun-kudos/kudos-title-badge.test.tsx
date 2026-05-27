import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TitleBadge } from "@/app/_components/sun-kudos/kudos-title-badge";

describe("<TitleBadge />", () => {
  it.each([
    ["New Hero", "new-hero.png"],
    ["Rising Hero", "rising-hero.png"],
    ["Super Hero", "super-hero.png"],
    ["Legend Hero", "legend-hero.png"],
  ])("renders the %s artwork with the rank as alt text", (rank, file) => {
    render(<TitleBadge title={rank} />);
    const img = screen.getByAltText(rank);
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain(file);
  });

  it("matches rank case-insensitively / trims whitespace", () => {
    render(<TitleBadge title="  rising hero  " />);
    expect(screen.getByRole("img").getAttribute("src")).toContain(
      "rising-hero.png"
    );
  });

  it("falls back to the New Hero artwork for an unknown rank", () => {
    render(<TitleBadge title="Mystery Hero" />);
    const img = screen.getByAltText("Mystery Hero");
    expect(img.getAttribute("src")).toContain("new-hero.png");
  });
});
