import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosUserAvatar } from "@/app/sun-kudos/_components/kudos-user-avatar";

describe("<KudosUserAvatar />", () => {
  // ---------------------------------------------------------------------------
  // With URL — renders <img>
  // ---------------------------------------------------------------------------
  it("renders an <img> element when url is provided", () => {
    render(<KudosUserAvatar url="https://cdn.example.com/avatar.png" name="Nguyen Van A" size={48} />);
    const img = screen.getByAltText("Nguyen Van A");
    expect(img.tagName).toBe("IMG");
  });

  it("img src matches the provided url", () => {
    render(<KudosUserAvatar url="https://cdn.example.com/avatar.png" name="Nguyen Van A" size={48} />);
    expect(screen.getByAltText("Nguyen Van A")).toHaveAttribute(
      "src",
      "https://cdn.example.com/avatar.png"
    );
  });

  it("img alt is the user name", () => {
    render(<KudosUserAvatar url="https://cdn.example.com/avatar.png" name="Le Thi B" size={32} />);
    expect(screen.getByAltText("Le Thi B")).toBeInTheDocument();
  });

  it("img dimensions match the size prop", () => {
    render(<KudosUserAvatar url="https://cdn.example.com/avatar.png" name="Test" size={72} />);
    const img = screen.getByAltText("Test");
    expect(img).toHaveAttribute("width", "72");
    expect(img).toHaveAttribute("height", "72");
  });

  it("img has circular border-radius via inline style", () => {
    render(<KudosUserAvatar url="https://cdn.example.com/avatar.png" name="Test" size={48} />);
    const img = screen.getByAltText("Test");
    expect(img).toHaveStyle({ borderRadius: "50%" });
  });

  // ---------------------------------------------------------------------------
  // Without URL — renders initial placeholder div
  // ---------------------------------------------------------------------------
  it("renders first-letter initial when url is null", () => {
    render(<KudosUserAvatar url={null} name="Nguyen Van A" size={48} />);
    expect(screen.getByText("N")).toBeInTheDocument();
  });

  it("initial is uppercase regardless of input casing", () => {
    render(<KudosUserAvatar url={null} name="alice" size={40} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("does not render an <img> when url is null", () => {
    render(<KudosUserAvatar url={null} name="Bob" size={48} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("placeholder div has circular border-radius via inline style", () => {
    const { container } = render(<KudosUserAvatar url={null} name="Carl" size={56} />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ borderRadius: "50%" });
  });

  it("placeholder div dimensions match the size prop", () => {
    const { container } = render(<KudosUserAvatar url={null} name="Dave" size={64} />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ width: "64px", height: "64px" });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------
  it("handles empty string url as falsy — shows initial", () => {
    // url="" is falsy in JS; component branches on truthiness
    render(<KudosUserAvatar url={null} name="Eve" size={48} />);
    expect(screen.getByText("E")).toBeInTheDocument();
  });

  it("single-character name uses that character as initial", () => {
    render(<KudosUserAvatar url={null} name="X" size={32} />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });
});
