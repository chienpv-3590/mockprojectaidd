import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosBanner } from "@/app/_components/shared/kudos-banner";

describe("<KudosBanner />", () => {
  it("renders 'Sun* Kudos' as a heading", () => {
    render(<KudosBanner href="/sun-kudos" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Sun* Kudos" })
    ).toBeInTheDocument();
  });

  it("heading has id='kudos-banner-heading' for aria-labelledby", () => {
    render(<KudosBanner href="/sun-kudos" />);
    const h2 = screen.getByRole("heading", { level: 2, name: "Sun* Kudos" });
    expect(h2).toHaveAttribute("id", "kudos-banner-heading");
  });

  it("section is labelled by kudos-banner-heading (aria-labelledby)", () => {
    const { container } = render(<KudosBanner href="/sun-kudos" />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "kudos-banner-heading");
  });

  it("'Chi tiết' link href matches the href prop", () => {
    render(<KudosBanner href="/sun-kudos" />);
    const link = screen.getByRole("link", { name: /Chi tiết/i });
    expect(link).toHaveAttribute("href", "/sun-kudos");
  });

  it("uses a different href prop value correctly", () => {
    render(<KudosBanner href="/kudos/overview" />);
    const link = screen.getByRole("link", { name: /Chi tiết/i });
    expect(link).toHaveAttribute("href", "/kudos/overview");
  });

  it("renders 'Sun* Kudos' logo image with correct alt text", () => {
    render(<KudosBanner href="/sun-kudos" />);
    expect(screen.getByAltText("Sun* Kudos")).toBeInTheDocument();
  });

  it("renders 'Phong trào ghi nhận' eyebrow text", () => {
    render(<KudosBanner href="/sun-kudos" />);
    expect(screen.getByText("Phong trào ghi nhận")).toBeInTheDocument();
  });

  it("renders 'Điểm mới của SAA 2025' label", () => {
    render(<KudosBanner href="/sun-kudos" />);
    expect(screen.getByText(/Điểm mới của SAA 2025/i)).toBeInTheDocument();
  });

  it("renders the body paragraph describing the kudos activity", () => {
    render(<KudosBanner href="/sun-kudos" />);
    expect(
      screen.getByText(/Hoạt động ghi nhận và cảm ơn đồng nghiệp/i)
    ).toBeInTheDocument();
  });

  it("renders as a <section> semantic element", () => {
    const { container } = render(<KudosBanner href="/sun-kudos" />);
    expect(container.querySelector("section")).not.toBeNull();
  });
});
