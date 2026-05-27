import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosHero } from "@/app/_components/sun-kudos/kudos-hero";

describe("<KudosHero />", () => {
  it("renders the hero section with correct aria label", () => {
    render(<KudosHero />);
    expect(
      screen.getByRole("region", { name: /Hệ thống ghi nhận và cảm ơn/i })
    ).toBeInTheDocument();
  });

  it("renders the h1 title text", () => {
    render(<KudosHero />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Hệ thống ghi nhận và cảm ơn",
      })
    ).toBeInTheDocument();
  });

  it("h1 has id 'kudos-hero-heading' for aria-labelledby", () => {
    render(<KudosHero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "kudos-hero-heading");
  });

  it("renders the Kudos wordmark image with correct alt text", () => {
    render(<KudosHero />);
    const img = screen.getByAltText("KUDOS");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/home/logo-kudos.svg");
  });

  it("section element is present as semantic root", () => {
    const { container } = render(<KudosHero />);
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
  });

  it("renders without throwing (smoke test)", () => {
    expect(() => render(<KudosHero />)).not.toThrow();
  });
});
