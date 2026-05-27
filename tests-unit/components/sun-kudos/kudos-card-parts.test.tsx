import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Avatar,
  PersonBlock,
  ArrowIcon,
  HeartButton,
} from "@/app/_components/sun-kudos/kudos-card-parts";

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
describe("<Avatar />", () => {
  it("renders <img> when url is provided", () => {
    render(<Avatar url="https://cdn.example.com/photo.jpg" name="Nguyen Van A" />);
    const img = screen.getByAltText("Nguyen Van A");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://cdn.example.com/photo.jpg");
  });

  it("renders last-2-word initials fallback when url is null", () => {
    render(<Avatar url={null} name="Nguyen Van A" />);
    // last 2 words: "Van" "A" → "VA"
    expect(screen.getByText("VA")).toBeInTheDocument();
  });

  it("renders initials fallback when url is undefined", () => {
    render(<Avatar name="Le Thi Bich" />);
    // last 2 words: "Thi" "Bich" → "TB"
    expect(screen.getByText("TB")).toBeInTheDocument();
  });

  it("handles single-word name for initials", () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("applies custom size to the wrapper div", () => {
    const { container } = render(<Avatar name="Bob" size={48} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("defaults to size 64", () => {
    const { container } = render(<Avatar name="Bob" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: "64px", height: "64px" });
  });
});

// ---------------------------------------------------------------------------
// PersonBlock
// ---------------------------------------------------------------------------
describe("<PersonBlock />", () => {
  const sender = {
    id: "u1",
    name: "Nguyen Van A",
    department: "Engineering",
    avatarUrl: null,
  };

  it("renders user name", () => {
    render(<PersonBlock user={sender} />);
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
  });

  it("renders department when provided", () => {
    render(<PersonBlock user={sender} />);
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("does not render department span when department is undefined", () => {
    const userNoDept = { id: "u2", name: "Tran B", avatarUrl: null };
    render(<PersonBlock user={userNoDept} />);
    // name is there, department is not
    expect(screen.getByText("Tran B")).toBeInTheDocument();
    expect(screen.queryByText("Engineering")).not.toBeInTheDocument();
  });

  it("renders avatar image when avatarUrl is set", () => {
    const userWithAvatar = { ...sender, avatarUrl: "https://cdn.example.com/a.png" };
    render(<PersonBlock user={userWithAvatar} />);
    expect(screen.getByAltText("Nguyen Van A")).toHaveAttribute(
      "src",
      "https://cdn.example.com/a.png"
    );
  });

  it("renders initials fallback when avatarUrl is null", () => {
    render(<PersonBlock user={sender} />);
    // last 2 words of "Nguyen Van A": "Van" "A" → "VA"
    expect(screen.getByText("VA")).toBeInTheDocument();
  });

  it("renders the department code BEFORE the danh hiệu badge (spec B.3.2)", () => {
    const u = {
      id: "u9",
      name: "Huỳnh Dương Xuân Nhật",
      department: "CEVC10",
      heroRank: "Rising Hero",
      avatarUrl: null,
    };
    render(<PersonBlock user={u} />);
    const dept = screen.getByText("CEVC10");
    const badge = screen.getByAltText("Rising Hero");
    // DOM order: department code precedes the badge.
    expect(
      dept.compareDocumentPosition(badge) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// ArrowIcon
// ---------------------------------------------------------------------------
describe("<ArrowIcon />", () => {
  it("renders an svg with aria-hidden", () => {
    const { container } = render(<ArrowIcon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden");
  });

  it("svg has the correct viewBox", () => {
    const { container } = render(<ArrowIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });
});

// ---------------------------------------------------------------------------
// HeartButton
// ---------------------------------------------------------------------------
describe("<HeartButton />", () => {
  it("renders the heart count formatted with vi-VN locale", () => {
    render(<HeartButton count={1234} />);
    // vi-VN uses period as thousands separator → "1.234"
    expect(screen.getByText("1.234")).toBeInTheDocument();
  });

  it("aria-label reflects count and un-hearted state", () => {
    render(<HeartButton count={5} hearted={false} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "5 tim — thả tim");
  });

  it("aria-label reflects count and hearted state", () => {
    render(<HeartButton count={3} hearted />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "3 tim — bỏ tim");
  });

  it("aria-pressed is true when hearted", () => {
    render(<HeartButton count={0} hearted />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("aria-pressed is false when not hearted", () => {
    render(<HeartButton count={0} hearted={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<HeartButton count={0} onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders count of 0 correctly", () => {
    render(<HeartButton count={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
