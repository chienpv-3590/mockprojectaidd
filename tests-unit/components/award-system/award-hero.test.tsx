import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardHero } from "@/app/_components/award-system/award-hero";

describe("<AwardHero />", () => {
  it("renders the main heading 'Hệ thống giải thưởng SAA 2025'", () => {
    render(<AwardHero />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Hệ thống giải thưởng SAA 2025" })
    ).toBeInTheDocument();
  });

  it("heading has id='award-hero-heading' for aria-labelledby", () => {
    render(<AwardHero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "award-hero-heading");
  });

  it("section is labelled by the hero heading (aria-labelledby)", () => {
    const { container } = render(<AwardHero />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "award-hero-heading");
  });

  it("renders ROOT FURTHER logo image with correct alt text", () => {
    render(<AwardHero />);
    expect(screen.getByAltText("ROOT FURTHER")).toBeInTheDocument();
  });

  it("renders the 'Sun* Annual Awards 2025' subtitle text", () => {
    render(<AwardHero />);
    expect(screen.getByText("Sun* Annual Awards 2025")).toBeInTheDocument();
  });

  it("heading text color is the design yellow (#FFEA9E)", () => {
    render(<AwardHero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveStyle({ color: "#FFEA9E" });
  });

  it("renders as a <section> semantic element", () => {
    const { container } = render(<AwardHero />);
    expect(container.querySelector("section")).not.toBeNull();
  });
});
