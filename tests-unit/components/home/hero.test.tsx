import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/app/_components/home/hero";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("<Hero />", () => {
  it("renders the ROOT FURTHER logo image", () => {
    render(<Hero />);
    expect(screen.getByAltText("ROOT FURTHER")).toBeInTheDocument();
  });

  it("renders the 'Comming soon' heading text", () => {
    render(<Hero />);
    expect(screen.getByText("Comming soon")).toBeInTheDocument();
  });

  it("renders the event date", () => {
    render(<Hero />);
    expect(screen.getByText("26/12/2025")).toBeInTheDocument();
  });

  it("renders the event location", () => {
    render(<Hero />);
    expect(screen.getByText("Âu Cơ Art Center")).toBeInTheDocument();
  });

  it("renders the livestream notice", () => {
    render(<Hero />);
    expect(
      screen.getByText("Tường thuật trực tiếp qua sóng Livestream")
    ).toBeInTheDocument();
  });

  it("renders the ABOUT AWARDS CTA link", () => {
    render(<Hero />);
    const link = screen.getByRole("link", { name: /ABOUT AWARDS/i });
    expect(link).toHaveAttribute("href", "/he-thong-giai");
  });

  it("renders the ABOUT KUDOS CTA link", () => {
    render(<Hero />);
    const link = screen.getByRole("link", { name: /ABOUT KUDOS/i });
    expect(link).toHaveAttribute("href", "/sun-kudos");
  });

  it("renders countdownSlot content when provided", () => {
    render(<Hero countdownSlot={<div data-testid="timer">TIMER</div>} />);
    expect(screen.getByTestId("timer")).toBeInTheDocument();
  });

  it("renders without countdownSlot (no crash)", () => {
    expect(() => render(<Hero />)).not.toThrow();
  });
});
