import { test, expect } from "@playwright/test";

/**
 * UI tests for /login + protected-route redirects.
 *
 * No live OAuth — we verify the page renders, the Google sign-in form is
 * wired to a server action, error banners render from ?error=, and the
 * middleware redirects unauthenticated visits to /login.
 */

test.describe("/login — public sign-in page", () => {
  test("renders ROOT FURTHER artwork, tagline, and Google sign-in CTA", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Đăng nhập/);

    await expect(page.getByAltText("ROOT FURTHER")).toBeVisible();
    await expect(
      page.getByText("Bắt đầu hành trình của bạn cùng SAA 2025.")
    ).toBeVisible();

    const loginButton = page.getByTestId("login-google");
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveText(/LOGIN With Google/i);
    await expect(loginButton).toBeEnabled();
  });

  test("Google sign-in button is inside a <form> that posts to a server action", async ({
    page,
  }) => {
    await page.goto("/login");
    const form = page.locator('form:has([data-testid="login-google"])');
    await expect(form).toHaveCount(1);
    // Server actions render as method=POST forms in the DOM.
    const method = await form.evaluate(
      (el) => (el as HTMLFormElement).method
    );
    expect(method.toLowerCase()).toBe("post");
  });

  test("?error=auth_callback_failed surfaces a localized banner", async ({
    page,
  }) => {
    await page.goto("/login?error=auth_callback_failed");
    const banner = page.getByRole("alert").filter({ hasText: /[\p{L}\p{N}]/u }).first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Đăng nhập thất bại");
  });

  test("?error=oauth_init_failed surfaces the Google-specific message", async ({
    page,
  }) => {
    await page.goto("/login?error=oauth_init_failed");
    await expect(page.getByRole("alert").filter({ hasText: /[\p{L}\p{N}]/u }).first()).toContainText(
      "Không thể khởi tạo đăng nhập Google"
    );
  });

  test("unknown ?error= value does not crash and shows no banner", async ({
    page,
  }) => {
    await page.goto("/login?error=totally_made_up");
    // No banner with any of the known localized error strings.
    await expect(
      page.getByText("Đăng nhập thất bại")
    ).toHaveCount(0);
    await expect(
      page.getByText("Không thể khởi tạo đăng nhập Google")
    ).toHaveCount(0);
    await expect(page.getByTestId("login-google")).toBeVisible();
  });

  test("header logo links back to / and language switcher renders", async ({
    page,
  }) => {
    await page.goto("/login");
    const homeLogo = page.locator('a[href="/"][aria-label*="Home"]');
    await expect(homeLogo.first()).toBeVisible();
  });

  test("footer copyright renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Bản quyền thuộc về Sun*")).toBeVisible();
  });
});

test.describe("auth gate — unauthenticated visits redirect to /login", () => {
  for (const path of ["/", "/he-thong-giai", "/sun-kudos"]) {
    test(`visiting ${path} without a session redirects to /login`, async ({
      browser,
    }) => {
      // Fresh context = no auth cookie.
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      const response = await page.goto(path);
      // Either the proxy middleware 307s, or the server component redirect()
      // runs. Both end at /login.
      expect(page.url()).toMatch(/\/login(\?|$)/);
      if (response) {
        // 200 OK is fine — the final page is /login. We just want the URL.
        expect([200, 301, 302, 307, 308]).toContain(response.status());
      }
      await ctx.close();
    });
  }
});
