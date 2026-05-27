import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TargetIcon, DiamondIcon, LicenseIcon } from "@/app/_components/award-system/award-icons";

describe("Award icon components", () => {
  describe("<TargetIcon />", () => {
    it("renders an svg element", () => {
      const { container } = render(<TargetIcon />);
      expect(container.querySelector("svg")).not.toBeNull();
    });

    it("has aria-hidden (decorative icon)", () => {
      const { container } = render(<TargetIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden");
    });

    it("defaults to size 24", () => {
      const { container } = render(<TargetIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
    });

    it("applies custom size prop", () => {
      const { container } = render(<TargetIcon size={40} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "40");
      expect(svg).toHaveAttribute("height", "40");
    });
  });

  describe("<DiamondIcon />", () => {
    it("renders an svg element", () => {
      const { container } = render(<DiamondIcon />);
      expect(container.querySelector("svg")).not.toBeNull();
    });

    it("has aria-hidden (decorative icon)", () => {
      const { container } = render(<DiamondIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden");
    });

    it("defaults to size 24", () => {
      const { container } = render(<DiamondIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
    });

    it("applies custom size prop", () => {
      const { container } = render(<DiamondIcon size={32} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "32");
      expect(svg).toHaveAttribute("height", "32");
    });
  });

  describe("<LicenseIcon />", () => {
    it("renders an svg element (Phosphor Medal underneath)", () => {
      const { container } = render(<LicenseIcon />);
      expect(container.querySelector("svg")).not.toBeNull();
    });

    it("has aria-hidden attribute (decorative)", () => {
      const { container } = render(<LicenseIcon />);
      const svg = container.querySelector("svg");
      // Phosphor passes aria-hidden through to the svg
      expect(svg).toHaveAttribute("aria-hidden");
    });

    it("defaults to size 24 — svg width/height reflect it", () => {
      const { container } = render(<LicenseIcon />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
    });

    it("applies custom size prop", () => {
      const { container } = render(<LicenseIcon size={20} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });
  });
});
