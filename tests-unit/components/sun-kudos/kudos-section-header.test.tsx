import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudosSectionHeader } from "@/app/_components/sun-kudos/kudos-section-header";

describe("<KudosSectionHeader />", () => {
  it("renders subtitle + title", () => {
    render(<KudosSectionHeader title="HIGHLIGHT KUDOS" />);
    expect(screen.getByText("Sun* Annual Awards 2025")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "HIGHLIGHT KUDOS" })
    ).toBeInTheDocument();
  });

  it("attaches id to the h2 when provided", () => {
    render(<KudosSectionHeader title="X" id="x-heading" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "x-heading"
    );
  });

  it("renders rightSlot beside the title", () => {
    render(
      <KudosSectionHeader
        title="X"
        rightSlot={<button type="button">filter</button>}
      />
    );
    expect(screen.getByRole("button", { name: "filter" })).toBeInTheDocument();
  });
});
