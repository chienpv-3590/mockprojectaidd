import { test as base } from "@playwright/test";
import { test, expect } from "./fixtures/auth";

/**
 * E2E tests for the General Standards page (`/tieu-chuan-cong-dong`).
 *
 * Covers:
 *  - authenticated render of both sections (Community + Security)
 *  - exactly 10 community-criteria list items
 *  - footer "Tiêu chuẩn chung" link navigates here
 *  - unauthenticated access redirects to /login
 */

const ROUTE = "/tieu-chuan-cong-dong";

test.describe(`${ROUTE} — General Standards page (authed)`, () => {
  test.beforeEach(async ({ authedContext, page }) => {
    void authedContext;
    await page.goto(ROUTE);
  });

  test("renders Community Standards + Security Standards headings", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "Tiêu chuẩn cộng đồng" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Tiêu chuẩn bảo mật" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Tiêu chuẩn chung" })
    ).toBeVisible();
  });

  test("renders exactly 10 community-criteria list items", async ({ page }) => {
    const communityHeading = page.getByRole("heading", {
      level: 2,
      name: "Tiêu chuẩn cộng đồng",
    });
    // The community <ol> is a sibling of the heading inside the same wrapper.
    const list = communityHeading.locator("xpath=../ol");
    await expect(list).toBeVisible();
    await expect(list.getByRole("listitem")).toHaveCount(10);
  });

  test("footer 'Tiêu chuẩn chung' link points at /tieu-chuan-cong-dong", async ({
    page,
  }) => {
    const footer = page.getByRole("contentinfo");
    const link = footer.getByRole("link", { name: "Tiêu chuẩn chung" });
    await expect(link).toHaveAttribute("href", ROUTE);
  });
});

// Unauth path — use the bare Playwright fixture (no auth cookie).
base.describe(`${ROUTE} — unauthenticated`, () => {
  base("redirects to /login with next=/tieu-chuan-cong-dong param", async ({ page }) => {
    await page.goto(ROUTE);
    const finalUrl = new URL(page.url());
    base.expect(finalUrl.pathname).toBe("/login");
    // The server-side redirect must preserve the `next` param so the user
    // returns to the protected page after signing in.
    base.expect(finalUrl.searchParams.get("next")).toBe(ROUTE);
  });
});
