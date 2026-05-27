import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/app/_components/home/user-menu";

// sign-out is a "use server" action — stub it so it never touches Supabase/redirect.
vi.mock("@/app/_actions/sign-out", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

const baseUser = {
  name: "Nguyen Van A",
  email: "nguyen@sun-asterisk.com",
  avatarUrl: null as string | null,
};

describe("<UserMenu />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the account menu button", () => {
    render(<UserMenu user={baseUser} />);
    expect(
      screen.getByRole("button", { name: "Account menu" })
    ).toBeInTheDocument();
  });

  it("shows the initial letter of the user's name when no avatarUrl", () => {
    render(<UserMenu user={baseUser} />);
    // Initial "N" appears inside the trigger button
    const btn = screen.getByRole("button", { name: "Account menu" });
    expect(btn.textContent).toBe("N");
  });

  it("renders an img when avatarUrl is provided", () => {
    // Avatar uses alt="" → role=presentation. Query DOM directly.
    const { container } = render(
      <UserMenu user={{ ...baseUser, avatarUrl: "https://example.com/a.png" }} />
    );
    const img = container.querySelector("img[src]");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("dropdown is closed initially", () => {
    render(<UserMenu user={baseUser} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the dropdown when the avatar button is clicked", async () => {
    render(<UserMenu user={baseUser} />);
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("shows the user name in the dropdown header", async () => {
    render(<UserMenu user={baseUser} />);
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    // name appears both in the trigger (initial) and in the dropdown
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
  });

  it("shows the user email in the dropdown header", async () => {
    render(<UserMenu user={baseUser} />);
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(
      screen.getByText("nguyen@sun-asterisk.com")
    ).toBeInTheDocument();
  });

  it("renders the sign-out menu item", async () => {
    render(<UserMenu user={baseUser} />);
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(
      screen.getByRole("menuitem", { name: "Đăng xuất" })
    ).toBeInTheDocument();
  });

  it("closes the dropdown on Escape key", async () => {
    render(<UserMenu user={baseUser} />);
    await userEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles the dropdown closed on second click", async () => {
    render(<UserMenu user={baseUser} />);
    const btn = screen.getByRole("button", { name: "Account menu" });
    await userEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(btn);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
