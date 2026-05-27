/**
 * Characterization (regression) tests for app/login/actions.ts — signInWithGoogle.
 *
 * Strategy:
 *  - next/headers and next/navigation are mocked at module level.
 *  - redirect() is made to throw so it halts control flow identically to the
 *    real Next.js runtime.
 *  - @/lib/supabase/server createClient is mocked and returns a minimal stub
 *    with auth.signInWithOAuth.
 *
 * app/login/page.tsx is NOT tested here — it is an async server component
 * already covered by tests/login.spec.ts (E2E / Playwright).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Module-level mocks — hoisted by Vitest before any import.
// ---------------------------------------------------------------------------

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle } from "@/app/login/actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal headers() stub that returns the given origin. */
function stubHeaders(origin: string) {
  const headersInstance = { get: vi.fn((key: string) => (key === "origin" ? origin : null)) };
  vi.mocked(headers).mockResolvedValue(headersInstance as never);
}

/** Build a Supabase stub whose auth.signInWithOAuth resolves with the given value. */
function stubSupabase(response: { data: { url: string | null } | null; error: { message: string } | null }) {
  const signInWithOAuth = vi.fn().mockResolvedValue(response);
  vi.mocked(createClient).mockResolvedValue({
    auth: { signInWithOAuth },
  } as never);
  return { signInWithOAuth };
}

// ---------------------------------------------------------------------------
// signInWithGoogle()
// ---------------------------------------------------------------------------

describe("signInWithGoogle()", () => {
  beforeEach(() => {
    // Clear call counts between tests so per-test assertions are isolated.
    vi.mocked(redirect).mockClear();
    vi.mocked(createClient).mockClear();
  });

  it("redirects to data.url on success", async () => {
    const ORIGIN = "https://example.com";
    stubHeaders(ORIGIN);
    stubSupabase({ data: { url: "https://accounts.google.com/o/oauth2/v2/auth?state=abc" }, error: null });

    await expect(signInWithGoogle()).rejects.toThrow(
      "REDIRECT:https://accounts.google.com/o/oauth2/v2/auth?state=abc"
    );
    expect(redirect).toHaveBeenCalledWith(
      "https://accounts.google.com/o/oauth2/v2/auth?state=abc"
    );
  });

  it("redirects to /login?error=oauth_init_failed when signInWithOAuth returns an error", async () => {
    stubHeaders("https://example.com");
    stubSupabase({ data: null, error: { message: "provider_disabled" } });

    await expect(signInWithGoogle()).rejects.toThrow(
      "REDIRECT:/login?error=oauth_init_failed"
    );
    expect(redirect).toHaveBeenCalledWith("/login?error=oauth_init_failed");
  });

  it("redirects to /login?error=oauth_init_failed when data.url is null (no error)", async () => {
    stubHeaders("https://example.com");
    stubSupabase({ data: { url: null }, error: null });

    await expect(signInWithGoogle()).rejects.toThrow(
      "REDIRECT:/login?error=oauth_init_failed"
    );
    expect(redirect).toHaveBeenCalledWith("/login?error=oauth_init_failed");
  });

  it("redirects to /login?error=oauth_init_failed when data is null with no error", async () => {
    stubHeaders("https://example.com");
    stubSupabase({ data: null, error: null });

    await expect(signInWithGoogle()).rejects.toThrow(
      "REDIRECT:/login?error=oauth_init_failed"
    );
    expect(redirect).toHaveBeenCalledWith("/login?error=oauth_init_failed");
  });

  it("passes origin from headers as redirectTo option: {origin}/auth/callback?next=/", async () => {
    const ORIGIN = "https://my-app.vercel.app";
    stubHeaders(ORIGIN);
    const { signInWithOAuth } = stubSupabase({
      data: { url: "https://google.com/auth" },
      error: null,
    });

    // let the redirect throw — we only care about what was passed to signInWithOAuth
    await expect(signInWithGoogle()).rejects.toThrow(/REDIRECT:/);

    expect(signInWithOAuth).toHaveBeenCalledOnce();
    const [callArg] = signInWithOAuth.mock.calls[0];
    expect(callArg).toMatchObject({
      provider: "google",
      options: {
        redirectTo: `${ORIGIN}/auth/callback?next=/`,
      },
    });
  });

  it("uses empty string as origin when headers().get('origin') returns null", async () => {
    const headersInstance = { get: vi.fn(() => null) };
    vi.mocked(headers).mockResolvedValue(headersInstance as never);
    const { signInWithOAuth } = stubSupabase({
      data: { url: "https://google.com/auth" },
      error: null,
    });

    await expect(signInWithGoogle()).rejects.toThrow(/REDIRECT:/);

    const [callArg] = signInWithOAuth.mock.calls[0];
    expect((callArg.options as { redirectTo: string }).redirectTo).toBe("/auth/callback?next=/");
  });

  it("calls createClient once per invocation", async () => {
    stubHeaders("https://example.com");
    stubSupabase({ data: { url: "https://google.com/auth" }, error: null });

    await expect(signInWithGoogle()).rejects.toThrow(/REDIRECT:/);
    expect(vi.mocked(createClient)).toHaveBeenCalledOnce();
  });
});
