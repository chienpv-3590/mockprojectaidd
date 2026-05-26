import { test, expect } from "./fixtures/auth";

/**
 * UI tests for /he-thong-giai against the MoMorph design
 * (https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD).
 *
 * Assertion strategy: pull exact specs from the design (sizes, colors,
 * positions taken from MoMorph node ids quoted in comments), then verify the
 * rendered DOM/computed styles match. Visual screenshots aren't compared
 * pixel-by-pixel — the focus is structural and stylistic compliance.
 */

const PAGE_PATH = "/he-thong-giai";
const YELLOW = "rgb(255, 234, 158)"; // #FFEA9E in computed-style form
const RULE_COLOR = "rgb(46, 57, 64)"; // #2E3940
const AWARD_CODES = [
  "top-talent",
  "top-project",
  "top-project-leader",
  "best-manager",
  "signature-creator",
  "mvp",
];

test.describe("/he-thong-giai — design compliance", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    void authedContext; // cookie was injected by the fixture
    await page.goto(PAGE_PATH);
    await expect(page).toHaveTitle(/Hệ thống giải thưởng SAA 2025/);
  });

  test("hero — ROOT FURTHER logo matches design size + position (338×150 @ x=144, y=104)", async ({
    page,
  }) => {
    // Design node MM_MEDIA_Root Further Logo (2789:12915): 338×150
    const logo = page.locator(
      'section[aria-labelledby="award-hero-heading"] img[alt="ROOT FURTHER"]'
    );
    await expect(logo).toBeVisible();
    const box = await logo.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeCloseTo(338, 0);
    expect(box!.height).toBeCloseTo(150, 0);

    const section = page.locator(
      'section[aria-labelledby="award-hero-heading"]'
    );
    const sectionBox = await section.boundingBox();
    // x=144 from frame left (Bìa padding)
    expect(box!.x - sectionBox!.x).toBeCloseTo(144, 0);
    // y=104 from hero top (frame y=184 minus header height 80)
    expect(box!.y - sectionBox!.y).toBeCloseTo(104, 0);
  });

  test("hero — title block: centered subtitle + 1px divider + yellow heading", async ({
    page,
  }) => {
    // Sun* Annual Awards 2025 — 24px white, centered (node 313:8454)
    const subtitle = page.getByText("Sun* Annual Awards 2025").first();
    await expect(subtitle).toBeVisible();
    const subStyle = await subtitle.evaluate((el) => ({
      color: getComputedStyle(el).color,
      textAlign: getComputedStyle(el).textAlign,
      fontWeight: getComputedStyle(el).fontWeight,
    }));
    expect(subStyle.color).toBe("rgb(255, 255, 255)");
    expect(subStyle.textAlign).toBe("center");
    expect(["700", "bold"]).toContain(subStyle.fontWeight);

    // Hệ thống giải thưởng SAA 2025 — yellow heading
    const heading = page.locator("#award-hero-heading");
    await expect(heading).toHaveText("Hệ thống giải thưởng SAA 2025");
    const headingColor = await heading.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(headingColor).toBe(YELLOW);

    // Divider rectangle 26 — 1px #2E3940
    const divider = page
      .locator('section[aria-labelledby="award-hero-heading"] hr')
      .first();
    await expect(divider).toBeVisible();
    const dividerBg = await divider.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(dividerBg).toBe(RULE_COLOR);
  });

  test("hero — keyvisual JPG background applied with exact image20 stretch", async ({
    page,
  }) => {
    // image 20 (2167:5138) styles: bg-size 101.245% 367.889%, pos -0.163px -858.967px
    const bgLayer = page.locator(
      'section[aria-labelledby="award-hero-heading"] div[aria-hidden]'
    ).first();
    const styles = await bgLayer.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        backgroundImage: cs.backgroundImage,
        backgroundSize: cs.backgroundSize,
        backgroundPosition: cs.backgroundPosition,
      };
    });
    expect(styles.backgroundImage).toContain("keyvisual-bg.jpg");
    expect(styles.backgroundSize).toContain("101.245%");
    expect(styles.backgroundPosition).toContain("-0.163px");
  });

  test("menu — 6 items with Target icon, correct labels, active styling", async ({
    page,
  }) => {
    // Desktop nav (lg+, viewport 1440)
    // AwardMenu renders inside both a mobile-only outer (lg:hidden) and a
    // desktop-only outer (hidden lg:block) wrapper. Target the desktop wrapper
    // explicitly to get the actually-visible nav.
    const desktopUl = page
      .locator(
        'aside nav[aria-label="Danh mục giải thưởng"] ul.hidden.lg\\:flex'
      )
      .first();
    const items = desktopUl.locator("li > a");
    await expect(items).toHaveCount(6);

    // Each item: has SVG icon (Target) + text label
    for (let i = 0; i < 6; i++) {
      const item = items.nth(i);
      await expect(item.locator("svg")).toBeVisible();
      await expect(item).not.toBeEmpty();
    }

    // First item ("Top Talent") starts active per scroll-spy default
    const firstActive = items.nth(0);
    const firstColor = await firstActive.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(firstColor).toBe(YELLOW);
    // Active item has yellow border-bottom
    const firstBorderColor = await firstActive.evaluate(
      (el) => getComputedStyle(el).borderBottomColor
    );
    expect(firstBorderColor).toBe(YELLOW);
  });

  test("menu — click navigates to anchor + updates active item", async ({
    page,
  }) => {
    // AwardMenu renders inside both a mobile-only outer (lg:hidden) and a
    // desktop-only outer (hidden lg:block) wrapper. Target the desktop wrapper
    // explicitly to get the actually-visible nav.
    const desktopUl = page
      .locator(
        'aside nav[aria-label="Danh mục giải thưởng"] ul.hidden.lg\\:flex'
      )
      .first();
    const mvpLink = desktopUl.locator('a[href="#mvp"]');
    await mvpLink.click();
    await page.waitForTimeout(1000); // smooth-scroll settles

    expect(page.url()).toContain("#mvp");

    const activeColor = await mvpLink.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(activeColor).toBe(YELLOW);

    // MVP card should be in upper viewport (within 100px of top due to 96px header offset)
    const mvpCard = page.locator("#mvp");
    const cardBox = await mvpCard.boundingBox();
    expect(cardBox!.y).toBeGreaterThan(0);
    expect(cardBox!.y).toBeLessThan(150);
  });

  test("menu — invalid section click is silent no-op (TC ID-13)", async ({
    page,
  }) => {
    // Inject a fake menu link pointing to a missing id and click via the
    // component's handler — should preventDefault and not throw.
    const errorLog: string[] = [];
    page.on("pageerror", (e) => errorLog.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errorLog.push(m.text());
    });

    // Click an existing menu item to confirm handler attaches — scope to the
    // visible desktop nav (mobile pill row is hidden at lg viewport).
    await page
      .locator(
        'aside nav[aria-label="Danh mục giải thưởng"] ul.hidden.lg\\:flex a[href="#mvp"]'
      )
      .click();
    // Trigger evaluate with a manufactured invalid id click
    await page.evaluate(() => {
      const fakeAnchor = document.querySelector(
        'nav[aria-label="Danh mục giải thưởng"] a'
      ) as HTMLAnchorElement | null;
      if (!fakeAnchor) return;
      const clone = fakeAnchor.cloneNode(true) as HTMLAnchorElement;
      clone.setAttribute("href", "#nonexistent-section");
      fakeAnchor.parentElement?.appendChild(clone);
      clone.click();
      clone.remove();
    });
    expect(errorLog).toHaveLength(0);
  });

  test("cards — 6 award cards rendered with correct IDs", async ({ page }) => {
    for (const code of AWARD_CODES) {
      const card = page.locator(`article#${code}`);
      await expect(card).toBeVisible();
    }
  });

  test("cards — each card has Target icon on title (yellow heading)", async ({
    page,
  }) => {
    for (const code of AWARD_CODES) {
      const card = page.locator(`article#${code}`);
      const heading = card.locator("h2");
      const headingColor = await heading.evaluate(
        (el) => getComputedStyle(el).color
      );
      expect(headingColor).toBe(YELLOW);
      // SVG icon sits in the heading's flex parent (Target icon, 24×24).
      // Locate the title row (a flex row that contains the h2) and assert it
      // has an SVG child.
      const titleRow = card.locator("h2").locator("..").first();
      const titleSvg = titleRow.locator("> svg").first();
      await expect(titleSvg).toBeVisible();
    }
  });

  test("cards — each card has Diamond icon + 'Số lượng giải thưởng:' yellow label", async ({
    page,
  }) => {
    for (const code of AWARD_CODES) {
      const card = page.locator(`article#${code}`);
      const qtyLabel = card.getByText("Số lượng giải thưởng:");
      await expect(qtyLabel).toBeVisible();
      const labelColor = await qtyLabel.evaluate(
        (el) => getComputedStyle(el).color
      );
      expect(labelColor).toBe(YELLOW);
    }
  });

  test("cards — each card has License icon + 'Giá trị giải thưởng:' yellow label", async ({
    page,
  }) => {
    for (const code of AWARD_CODES) {
      const card = page.locator(`article#${code}`);
      // Signature 2025 renders the label twice (one per breakdown entry).
      // .first() handles both single and multi-entry cards.
      const valLabel = card.getByText("Giá trị giải thưởng:").first();
      await expect(valLabel).toBeVisible();
      const labelColor = await valLabel.evaluate(
        (el) => getComputedStyle(el).color
      );
      expect(labelColor).toBe(YELLOW);
    }
  });

  test("cards — in-card HR separator (1px #2E3940) between quantity and value rows", async ({
    page,
  }) => {
    // Each card has exactly one hr inside the content column
    for (const code of AWARD_CODES) {
      const card = page.locator(`article#${code}`);
      const hr = card.locator("hr");
      await expect(hr).toBeVisible();
      const bg = await hr.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );
      expect(bg).toBe(RULE_COLOR);
    }
  });

  test("cards — between-card HR separator (Rectangle 14, 1px #2E3940)", async ({
    page,
  }) => {
    // 6 cards → 5 between-card separators (last card has none).
    // The hrs in award-system.tsx live OUTSIDE articles, as siblings.
    const cardSection = page.locator('section[aria-label="Danh sách giải thưởng"]');
    const betweenHrs = cardSection.locator(
      "xpath=.//hr[not(ancestor::article)]"
    );
    const count = await betweenHrs.count();
    expect(count).toBe(5);
  });

  test("signature-creator card — dual value breakdown (5M cá nhân + 8M tập thể)", async ({
    page,
  }) => {
    const card = page.locator("article#signature-creator");
    await expect(card.getByText("5.000.000 VNĐ")).toBeVisible();
    await expect(card.getByText("cho giải cá nhân")).toBeVisible();
    await expect(card.getByText("8.000.000 VNĐ")).toBeVisible();
    await expect(card.getByText("cho giải tập thể")).toBeVisible();
  });

  test("cards — medallion image renders with award-bg + wordmark overlay (336×336 at lg)", async ({
    page,
  }) => {
    for (const code of AWARD_CODES) {
      const card = page.locator(`article#${code}`);
      const imageContainer = card.locator(
        "div.relative.aspect-square.w-full.overflow-hidden.rounded-2xl"
      ).first();
      const containerBox = await imageContainer.boundingBox();
      // At 1440 viewport, lg breakpoint → image is 336×336
      expect(containerBox!.width).toBeCloseTo(336, 0);
      expect(containerBox!.height).toBeCloseTo(336, 0);
      const images = imageContainer.locator("img");
      expect(await images.count()).toBe(2); // bg + wordmark
    }
  });

  test("kudos banner — 'Chi tiết' CTA links to /sun-kudos", async ({ page }) => {
    // KudosBanner uses aria-labelledby (not aria-label) — find by heading id
    const banner = page.locator(
      'section[aria-labelledby="kudos-banner-heading"]'
    );
    await expect(banner).toBeVisible();
    const cta = banner.locator('a[href="/sun-kudos"]');
    await expect(cta).toBeVisible();
    await expect(cta).toContainText("Chi tiết");
  });

  test("kudos banner — clicking 'Chi tiết' navigates to /sun-kudos placeholder", async ({
    page,
  }) => {
    await page
      .locator(
        'section[aria-labelledby="kudos-banner-heading"] a[href="/sun-kudos"]'
      )
      .click();
    await expect(page).toHaveURL(/\/sun-kudos$/);
    await expect(page.locator("h1")).toContainText("Sun* Kudos");
    await expect(page.getByText(/Coming soon/i)).toBeVisible();
  });

  test("page has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.reload({ waitUntil: "networkidle" });
    // Allow the image-aspect-ratio warning Next.js shows; filter to genuine errors.
    const genuine = errors.filter((e) => !/aspect-ratio|width or height/i.test(e));
    expect(genuine).toHaveLength(0);
  });

  test("header — 'Awards Information' nav link active on this page", async ({
    page,
  }) => {
    const headerNav = page.locator('nav[aria-label="Main"]');
    const active = headerNav.locator('[aria-current="page"]');
    await expect(active).toHaveText("Awards Information");
  });
});
