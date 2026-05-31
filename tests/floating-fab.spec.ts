import { test as base } from "@playwright/test";
import { test, expect } from "./fixtures/auth";

/**
 * E2E tests for the global Floating Action Button feature.
 *
 * Covers:
 *  - FAB visible on every authed page (`/`, `/he-thong-giai`,
 *    `/tieu-chuan-cong-dong`).
 *  - FAB hidden on `/login`.
 *  - Expand → close X collapses.
 *  - Expand → Thể lệ opens the right-side drawer with title + 4 tiers + 6
 *    icons. Đóng closes the drawer.
 *  - Expand → Viết KUDOS opens the SubmitKudosDialog without leaving the
 *    current page (URL stays the same).
 */

const FAB_OPEN = "Mở menu nhanh";
const FAB_CLOSE = "Đóng menu";
const RULES_LABEL = "Thể lệ";
const WRITE_LABEL = "Viết KUDOS";

test.describe("FloatingFab — authed flows", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    void authedContext;
    await page.goto("/");
  });

  test("collapsed pill is visible on the home page", async ({ page }) => {
    await expect(page.getByRole("button", { name: FAB_OPEN })).toBeVisible();
  });

  test("expand → close X collapses again", async ({ page }) => {
    await page.getByRole("button", { name: FAB_OPEN }).click();
    await expect(page.getByRole("button", { name: RULES_LABEL })).toBeVisible();
    await expect(page.getByRole("button", { name: WRITE_LABEL })).toBeVisible();
    await page.getByRole("button", { name: FAB_CLOSE }).click();
    await expect(page.getByRole("button", { name: RULES_LABEL })).toBeHidden();
    await expect(page.getByRole("button", { name: FAB_OPEN })).toBeVisible();
  });

  test("Thể lệ opens the drawer with 4 tiers + 6 icons; Đóng closes it", async ({ page }) => {
    await page.getByRole("button", { name: FAB_OPEN }).click();
    await page.getByRole("button", { name: RULES_LABEL }).click();

    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("heading", { level: 2, name: RULES_LABEL })).toBeVisible();

    // The drawer has two <ul> elements: the first is the hero-tier list,
    // the second is the secret-icon grid. Count via locator.
    const lists = drawer.locator("ul");
    await expect(lists.nth(0).getByRole("listitem")).toHaveCount(4);
    await expect(lists.nth(1).getByRole("listitem")).toHaveCount(6);

    // Footer Đóng (button, not the backdrop) — pick the one with text.
    const closeBtn = drawer.getByRole("button", { name: "Đóng" });
    await closeBtn.click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("Viết KUDOS opens the SubmitKudosDialog without navigating", async ({ page }) => {
    // Start on /tieu-chuan-cong-dong to prove cross-page persistence and
    // no-navigation behavior.
    await page.goto("/tieu-chuan-cong-dong");
    await expect(page.getByRole("button", { name: FAB_OPEN })).toBeVisible();

    await page.getByRole("button", { name: FAB_OPEN }).click();
    await page.getByRole("button", { name: WRITE_LABEL }).click();

    // SubmitKudosDialog title (from existing dialog chrome).
    await expect(
      page.getByText("Gửi lời cám ơn và ghi nhận đến đồng đội")
    ).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/tieu-chuan-cong-dong");
  });

  test("FAB persists on /he-thong-giai", async ({ page }) => {
    await page.goto("/he-thong-giai");
    await expect(page.getByRole("button", { name: FAB_OPEN })).toBeVisible();
  });
});

// Unauth path — bare Playwright fixture (no auth cookie injection).
base.describe("FloatingFab — unauthenticated", () => {
  base("FAB is NOT rendered on /login", async ({ page }) => {
    await page.goto("/login");
    // Auth-gated layout skips mounting the FAB for unauth users.
    await base
      .expect(page.getByRole("button", { name: FAB_OPEN }))
      .toBeHidden();
  });
});
