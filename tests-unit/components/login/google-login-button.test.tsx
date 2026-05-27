/**
 * Characterization (regression) tests for
 * app/login/_components/google-login-button.tsx — GoogleLoginButton.
 *
 * The component uses useFormStatus() from react-dom; we mock that module so we
 * can control the pending state without a real form submission.
 *
 * Rendering strategy:
 *  - idle state  (pending=false): default factory helper
 *  - pending state (pending=true): re-mock useFormStatus before rendering
 *
 * Query notes:
 *  - The Google logo has alt="" which maps to role="presentation" (decorative).
 *    Use getAllByRole("presentation", { hidden: true }) to find it.
 *  - The Spinner SVG has both role="status" AND aria-hidden="true", so it is
 *    hidden from the a11y tree. Use getByRole("status", { hidden: true }).
 *  - jsdom returns lowercase tagName for SVG elements (unlike HTML elements),
 *    so assertions use .toLowerCase() for portability.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mock react-dom to control useFormStatus — must be declared before import.
// ---------------------------------------------------------------------------

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return {
    ...actual,
    useFormStatus: vi.fn(() => ({ pending: false })),
  };
});

import { useFormStatus } from "react-dom";
import { GoogleLoginButton } from "@/app/login/_components/google-login-button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setPending(value: boolean) {
  vi.mocked(useFormStatus).mockReturnValue({ pending: value } as ReturnType<typeof useFormStatus>);
}

function renderIdle() {
  setPending(false);
  return render(<GoogleLoginButton />);
}

function renderPending() {
  setPending(true);
  return render(<GoogleLoginButton />);
}

// ---------------------------------------------------------------------------
// Tests — idle state (pending=false)
// ---------------------------------------------------------------------------

describe("<GoogleLoginButton /> — idle state (pending=false)", () => {
  beforeEach(() => {
    setPending(false);
  });

  it("renders a <button> element", () => {
    renderIdle();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("has type='submit' so it triggers its parent form", () => {
    renderIdle();
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("has data-testid='login-google'", () => {
    renderIdle();
    expect(screen.getByTestId("login-google")).toBeInTheDocument();
  });

  it("shows idle label text 'LOGIN With Google'", () => {
    renderIdle();
    expect(screen.getByText("LOGIN With Google")).toBeInTheDocument();
  });

  it("renders the Google logo as a decorative image (alt='' → role=presentation)", () => {
    renderIdle();
    // alt="" means the img is treated as decorative; its ARIA role is "presentation".
    // { hidden: true } is required because aria-hidden elements are excluded by default.
    const imgs = screen.getAllByRole("presentation", { hidden: true });
    const googleLogo = imgs.find(
      (el) => el.tagName.toLowerCase() === "img" && (el as HTMLImageElement).src.includes("google.svg")
    );
    expect(googleLogo).toBeInTheDocument();
  });

  it("is NOT disabled when not pending", () => {
    renderIdle();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("aria-busy is false when not pending", () => {
    renderIdle();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "false");
  });
});

// ---------------------------------------------------------------------------
// Tests — pending state (pending=true)
// ---------------------------------------------------------------------------

describe("<GoogleLoginButton /> — pending state (pending=true)", () => {
  beforeEach(() => {
    setPending(true);
  });

  it("is disabled when pending", () => {
    renderPending();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("aria-busy is true when pending", () => {
    renderPending();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("shows pending label 'Đang đăng nhập…' when pending", () => {
    renderPending();
    expect(screen.getByText("Đang đăng nhập…")).toBeInTheDocument();
  });

  it("hides idle label when pending", () => {
    renderPending();
    expect(screen.queryByText("LOGIN With Google")).not.toBeInTheDocument();
  });

  it("renders the Spinner SVG (role=status, aria-hidden=true) when pending", () => {
    renderPending();
    // The Spinner has role="status" but also aria-hidden="true", so it is removed
    // from the accessible tree. { hidden: true } opts in to searching hidden elements.
    // jsdom returns lowercase tagName for SVG elements — compare case-insensitively.
    const spinner = screen.getByRole("status", { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner.tagName.toLowerCase()).toBe("svg");
  });
});
