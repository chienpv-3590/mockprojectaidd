import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DialogHeader,
  DialogActions,
} from "@/app/_components/sun-kudos/submit-kudos-dialog-chrome";

describe("<DialogHeader />", () => {
  it("renders the dialog title", () => {
    render(<DialogHeader onClose={() => {}} />);
    expect(screen.getByText("Gửi lời cảm ơn")).toBeInTheDocument();
  });

  it("title has correct heading level id for aria-labelledby", () => {
    render(<DialogHeader onClose={() => {}} />);
    expect(document.getElementById("dialog-title")).toBeInTheDocument();
  });

  it("renders a close button with accessible label 'Đóng'", () => {
    render(<DialogHeader onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "Đóng" })).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogHeader onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Đóng" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("<DialogActions />", () => {
  it("renders cancel and send buttons", () => {
    render(<DialogActions onClose={() => {}} submitting={false} canSubmit={true} />);
    expect(screen.getByRole("button", { name: "Hủy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi" })).toBeInTheDocument();
  });

  it("cancel button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogActions onClose={onClose} submitting={false} canSubmit={true} />);
    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("send button is enabled when canSubmit=true and submitting=false", () => {
    render(<DialogActions onClose={() => {}} submitting={false} canSubmit={true} />);
    expect(screen.getByRole("button", { name: "Gửi" })).not.toBeDisabled();
  });

  it("send button is disabled when canSubmit=false", () => {
    render(<DialogActions onClose={() => {}} submitting={false} canSubmit={false} />);
    expect(screen.getByRole("button", { name: "Gửi" })).toBeDisabled();
  });

  it("shows 'Đang gửi...' text and spinner when submitting=true", () => {
    render(<DialogActions onClose={() => {}} submitting={true} canSubmit={false} />);
    expect(screen.getByText("Đang gửi...")).toBeInTheDocument();
  });

  it("send button is disabled while submitting", () => {
    render(<DialogActions onClose={() => {}} submitting={true} canSubmit={false} />);
    const btn = screen.getByRole("button", { name: /Đang gửi/ });
    expect(btn).toBeDisabled();
  });

  it("cancel button is disabled while submitting", () => {
    render(<DialogActions onClose={() => {}} submitting={true} canSubmit={false} />);
    expect(screen.getByRole("button", { name: "Hủy" })).toBeDisabled();
  });

  it("send button is type=submit so it can trigger form submission", () => {
    render(<DialogActions onClose={() => {}} submitting={false} canSubmit={true} />);
    expect(screen.getByRole("button", { name: "Gửi" })).toHaveAttribute("type", "submit");
  });
});
