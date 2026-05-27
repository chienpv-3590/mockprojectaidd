import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FloatingFab } from "@/app/_components/home/floating-fab";

describe("<FloatingFab />", () => {
  it("renders the FAB container in the DOM", () => {
    const { container } = render(<FloatingFab />);
    // aria-hidden div — query by fixed positioning class
    const fab = container.querySelector(".fixed");
    expect(fab).toBeInTheDocument();
  });

  it("renders the pen icon image", () => {
    // alt="" → role=presentation, not img. Query the DOM directly.
    const { container } = render(<FloatingFab />);
    const srcs = Array.from(container.querySelectorAll("img")).map((i) => i.src);
    expect(srcs.some((s) => s.includes("pen.svg"))).toBe(true);
  });

  it("renders the logo image", () => {
    const { container } = render(<FloatingFab />);
    const srcs = Array.from(container.querySelectorAll("img")).map((i) => i.src);
    expect(srcs.some((s) => s.includes("logo.png"))).toBe(true);
  });

  it("renders the slash separator", () => {
    const { container } = render(<FloatingFab />);
    expect(container.textContent).toContain("/");
  });

  it("is aria-hidden so screen readers skip it", () => {
    const { container } = render(<FloatingFab />);
    const fab = container.firstChild as HTMLElement;
    expect(fab).toHaveAttribute("aria-hidden", "true");
  });
});
