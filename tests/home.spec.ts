import { test, expect } from "./fixtures/auth";

/**
 * UI tests for the authenticated home page ("/").
 *
 * Covers: hero hrefs, awards grid (6 cards → /he-thong-giai#{code}), kudos
 * banner href, header active state on "/", footer link hrefs, and the
 * scroll-to-top behavior on active nav link / logo clicks
 * (per design A1.1 / A1.2).
 */

const YELLOW = "rgb(255, 234, 158)";

const AWARD_CODES = [
  "top-talent",
  "top-project",
  "top-project-leader",
  "best-manager",
  "signature-creator",
  "mvp",
];

test.describe("/ — home page", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    void authedContext;
    await page.goto("/");
  });

  test("hero — ABOUT AWARDS links to /he-thong-giai, ABOUT KUDOS to /sun-kudos", async ({
    page,
  }) => {
    const aboutAwards = page.getByRole("link", { name: /ABOUT AWARDS/i });
    const aboutKudos = page.getByRole("link", { name: /ABOUT KUDOS/i });
    await expect(aboutAwards).toBeVisible();
    await expect(aboutKudos).toBeVisible();
    await expect(aboutAwards).toHaveAttribute("href", "/he-thong-giai");
    await expect(aboutKudos).toHaveAttribute("href", "/sun-kudos");
  });

  test("awards grid — 6 cards, each links to /he-thong-giai#{code}", async ({
    page,
  }) => {
    for (const code of AWARD_CODES) {
      const link = page
        .locator(`a[href="/he-thong-giai#${code}"]`)
        .first();
      await expect(link).toBeVisible();
    }
    // No leftover bare-hash hrefs on award cards.
    const bareHash = await page
      .locator('article a[href^="#"]')
      .count();
    expect(bareHash).toBe(0);
  });

  test("kudos banner — Chi tiết button links to /sun-kudos", async ({
    page,
  }) => {
    const banner = page.locator(
      'section[aria-labelledby="kudos-banner-heading"]'
    );
    await expect(banner).toBeVisible();
    const cta = banner.getByRole("link", { name: /Chi tiết/i });
    await expect(cta).toHaveAttribute("href", "/sun-kudos");
  });

  test("header nav — About SAA 2025 is active on /, hover bg fades in", async ({
    page,
  }) => {
    const aboutLink = page
      .locator('nav[aria-label="Main"] a[href="/"]')
      .first();
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveAttribute("aria-current", "page");
    const color = await aboutLink.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe(YELLOW);

    // Hover state — Button-IC spec: bg rgba(255, 234, 158, 0.1).
    // Wait for the CSS transition to settle before sampling computed style.
    await aboutLink.hover();
    await expect
      .poll(
        async () =>
          aboutLink.evaluate(
            (el) => getComputedStyle(el).backgroundColor
          ),
        { timeout: 2000 }
      )
      .toBe("rgba(255, 234, 158, 0.1)");
  });

  test("header nav — Awards Information + Sun* Kudos have correct hrefs", async ({
    page,
  }) => {
    const nav = page.locator('nav[aria-label="Main"]');
    await expect(
      nav.locator('a[href="/he-thong-giai"]')
    ).toBeVisible();
    await expect(nav.locator('a[href="/sun-kudos"]')).toBeVisible();
  });

  test("active nav link click scrolls to top instead of navigating", async ({
    page,
  }) => {
    // Scroll down first.
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(150);
    const beforeY = await page.evaluate(() => window.scrollY);
    expect(beforeY).toBeGreaterThan(500);

    // Click the active "About SAA 2025" link.
    await page
      .locator('nav[aria-label="Main"] a[href="/"]')
      .first()
      .click();
    // Smooth scroll — give it time to settle.
    await page.waitForFunction(() => window.scrollY < 20, null, {
      timeout: 2000,
    });
    expect(page.url()).toMatch(/\/$/);
  });

  test("footer — all expected links render with correct hrefs", async ({
    page,
  }) => {
    const footer = page.locator("footer");
    await expect(footer.getByText("Bản quyền thuộc về Sun*")).toBeVisible();
    await expect(
      footer.locator('a[href="/"]').first()
    ).toBeVisible();
    await expect(footer.locator('a[href="/he-thong-giai"]')).toBeVisible();
    await expect(footer.locator('a[href="/sun-kudos"]')).toBeVisible();
    await expect(footer.getByText("Tiêu chuẩn chung")).toBeVisible();
  });

  test("footer nav hover — Button-IC bg rgba(255,234,158,0.1)", async ({
    page,
  }) => {
    const link = page
      .locator('footer nav[aria-label="Footer"] a[href="/he-thong-giai"]')
      .first();
    await link.hover();
    await expect
      .poll(
        async () =>
          link.evaluate((el) => getComputedStyle(el).backgroundColor),
        { timeout: 2000 }
      )
      .toBe("rgba(255, 234, 158, 0.1)");
  });

  test("page has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Ignore third-party noise (none expected on /).
    expect(errors).toEqual([]);
  });
});
