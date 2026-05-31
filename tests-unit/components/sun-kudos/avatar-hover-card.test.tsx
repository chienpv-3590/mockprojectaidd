import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const routerPush = vi.fn();
const openCompose = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

const getAvatarHoverDataMock = vi.fn();
vi.mock("@/app/_actions/sun-kudos", () => ({
  getAvatarHoverData: (id: string) => getAvatarHoverDataMock(id),
}));

import { AvatarHoverCard } from "@/app/_components/sun-kudos/avatar-hover-card";
import { ComposeKudosProvider } from "@/app/_components/sun-kudos/compose-kudos-context";

const profile = {
  user_id: "11111111-2222-3333-4444-555555555555",
  full_name_vi: "Huỳnh Dương Xuân Nhật",
  department_code: "CC",
  department_name_vi: "Culture & Communication",
  employee_code: null,
  title: "Executive/C&C Line/HRD Unit/OPD Center",
  avatar_url: null,
  tier: 2 as const,
};

beforeEach(() => {
  routerPush.mockReset();
  openCompose.mockReset();
  getAvatarHoverDataMock.mockReset();
});

describe("<AvatarHoverCard />", () => {
  it("shows loading then renders fetched data", async () => {
    getAvatarHoverDataMock.mockResolvedValueOnce({
      profile,
      received: 25,
      sent: 25,
      hero_rank: "Legend Hero",
    });

    render(<AvatarHoverCard userId={profile.user_id} />);

    expect(screen.getByText("Đang tải…")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Huỳnh Dương Xuân Nhật")).toBeInTheDocument()
    );
    expect(screen.getByText(/Culture & Communication/)).toBeInTheDocument();
    expect(screen.getByText(profile.title!)).toBeInTheDocument();
    expect(screen.getByAltText("Legend Hero")).toBeInTheDocument();
    expect(screen.getByText("Số Kudos nhận được:")).toBeInTheDocument();
    expect(screen.getByText("Số Kudos đã gửi:")).toBeInTheDocument();
    // Stats values
    const received = screen.getAllByText("25");
    expect(received.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: /Gửi KUDO cho/ })).toBeInTheDocument();
  });

  it("shows error state when fetch returns null", async () => {
    getAvatarHoverDataMock.mockResolvedValueOnce(null);
    render(<AvatarHoverCard userId={profile.user_id} />);
    await waitFor(() =>
      expect(screen.getByText("Không thể tải thông tin người dùng.")).toBeInTheDocument()
    );
  });

  it("opens compose via context when provider is mounted", async () => {
    getAvatarHoverDataMock.mockResolvedValueOnce({
      profile, received: 1, sent: 1, hero_rank: null,
    });

    render(
      <ComposeKudosProvider value={{ openCompose }}>
        <AvatarHoverCard userId={profile.user_id} />
      </ComposeKudosProvider>
    );

    const btn = await screen.findByRole("button", { name: /Gửi KUDO cho/ });
    await userEvent.click(btn);

    expect(openCompose).toHaveBeenCalledTimes(1);
    expect(openCompose).toHaveBeenCalledWith(profile);
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("navigates to ?compose= deep-link when no provider in tree", async () => {
    getAvatarHoverDataMock.mockResolvedValueOnce({
      profile, received: 0, sent: 0, hero_rank: null,
    });
    render(<AvatarHoverCard userId={profile.user_id} />);
    const btn = await screen.findByRole("button", { name: /Gửi KUDO cho/ });
    await userEvent.click(btn);

    expect(routerPush).toHaveBeenCalledWith(`/sun-kudos?compose=${profile.user_id}`);
  });

  it("hides Gửi KUDO button when hideSendButton is true", async () => {
    getAvatarHoverDataMock.mockResolvedValueOnce({
      profile, received: 0, sent: 0, hero_rank: null,
    });
    render(<AvatarHoverCard userId={profile.user_id} hideSendButton />);
    await screen.findByText("Huỳnh Dương Xuân Nhật");
    expect(screen.queryByRole("button", { name: /Gửi KUDO cho/ })).not.toBeInTheDocument();
  });
});
