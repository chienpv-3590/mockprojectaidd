import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import type { AppNotification } from "@/lib/data/types";

// Mock the server action — it lives in a "use server" module that can't run in jsdom.
vi.mock("@/app/_actions/mark-notifications-read", () => ({
  markNotificationsRead: vi.fn().mockResolvedValue(undefined),
}));

function buildNotification(over: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "n1",
    title: "Test notification",
    body: "Notification body",
    read: false,
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min ago
    ...over,
  };
}

describe("<NotificationBell />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the bell button with accessible label", () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={0} />
    );
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument();
  });

  it("shows unread badge when initialUnreadCount > 0", () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={3} />
    );
    expect(screen.getByLabelText("3 unread")).toBeInTheDocument();
  });

  it("does NOT show badge when initialUnreadCount is 0", () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={0} />
    );
    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument();
  });

  it("caps the badge at 99+ for large counts", () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={120} />
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("dropdown is closed initially", () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={0} />
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the dropdown when the bell button is clicked", async () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={0} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("shows 'Chưa có thông báo nào' when notification list is empty and dropdown open", async () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={0} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Chưa có thông báo nào")).toBeInTheDocument();
  });

  it("renders notification titles in the dropdown", async () => {
    const notifications = [
      buildNotification({ id: "n1", title: "Kudos nhận được" }),
      buildNotification({ id: "n2", title: "Giải thưởng mới" }),
    ];
    render(
      <NotificationBell
        initialNotifications={notifications}
        initialUnreadCount={2}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Kudos nhận được")).toBeInTheDocument();
    expect(screen.getByText("Giải thưởng mới")).toBeInTheDocument();
  });

  it("clears the unread badge immediately on open when unread > 0", async () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={5} />
    );
    expect(screen.getByLabelText("5 unread")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.queryByLabelText(/unread/)).not.toBeInTheDocument();
  });

  it("calls markNotificationsRead when opened with unread > 0", async () => {
    const { markNotificationsRead } = await import(
      "@/app/_actions/mark-notifications-read"
    );
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={2} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    // useTransition batches the call — wait a tick
    await vi.waitFor(() => {
      expect(markNotificationsRead).toHaveBeenCalled();
    });
  });

  it("closes the dropdown on Escape key", async () => {
    render(
      <NotificationBell initialNotifications={[]} initialUnreadCount={0} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
