# `/he-thong-giai` UI test suite — QA report

**Date:** 2026-05-26
**Status:** DONE — 18/18 PASS, 40.2s
**Tool:** Playwright @1.60.0 (Chromium 1440×900)
**Design ref:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD

## Infrastructure added
- `@playwright/test` + `dotenv` (dev deps)
- `playwright.config.ts` — loads `.env.local`, baseURL `localhost:3000`, viewport 1440×900
- `tests/fixtures/auth.ts` — mints a test user via Supabase Auth Admin (service_role fetched from Management API using PAT), signs in, injects `sb-{ref}-auth-token` cookie. Teardown deletes the user.
- `tests/he-thong-giai.spec.ts` — 18 design-compliance assertions
- npm scripts: `test`, `test:headed`, `test:report`

## Test results

| # | Test | Result |
|---|------|--------|
| 1 | hero — ROOT FURTHER 338×150 at x=144, y=104 | ✅ PASS |
| 2 | hero — title block: centered subtitle + 1px divider + yellow heading | ✅ PASS |
| 3 | hero — keyvisual exact image20 stretch (101.245%/367.889%, -858.967px) | ✅ PASS |
| 4 | menu — 6 items with Target icon, active styling | ✅ PASS |
| 5 | menu — click navigates to anchor + updates active item | ✅ PASS |
| 6 | menu — invalid section click is silent no-op (TC ID-13) | ✅ PASS |
| 7 | cards — 6 award cards rendered with correct IDs | ✅ PASS |
| 8 | cards — Target icon + yellow heading | ✅ PASS |
| 9 | cards — Diamond icon + "Số lượng giải thưởng:" yellow | ✅ PASS |
| 10 | cards — License icon + "Giá trị giải thưởng:" yellow | ✅ PASS |
| 11 | cards — in-card HR (1px #2E3940) between quantity and value | ✅ PASS |
| 12 | cards — between-card HR (Rectangle 14, ×5 separators) | ✅ PASS |
| 13 | signature-creator — dual breakdown (5M cá nhân + 8M tập thể) | ✅ PASS |
| 14 | cards — medallion 336×336 with award-bg + wordmark overlay | ✅ PASS |
| 15 | kudos banner — "Chi tiết" CTA links to /sun-kudos | ✅ PASS |
| 16 | kudos banner — clicking navigates to /sun-kudos placeholder | ✅ PASS |
| 17 | page has no console errors on load | ✅ PASS |
| 18 | header — "Awards Information" nav link active | ✅ PASS |

**Totals:** 18 passed, 0 failed, 0 skipped. Duration 40.2s.

## What each test asserts (design refs in `()`)

- **Hero logo** (`MM_MEDIA_Root Further Logo` 2789:12915): exact 338×150 dimensions, exact x=144 from frame left, exact y=104 from hero top.
- **Hero typography** (`Sun* Annual Awards 2025` 313:8454, `Hệ thống giải thưởng SAA 2025` 313:8457, divider `Rectangle 26` 313:8455): subtitle white 700 centered, divider bg `rgb(46,57,64)`, heading yellow `rgb(255,234,158)`.
- **Hero keyvisual** (`image 20` 2167:5138): exact `background-size: 101.245% 367.889%` and `background-position` containing `-0.163px`.
- **Menu** (`mms_C_Menu list` 313:8459 + items 313:8460–313:8465): 6 items, each with SVG icon + label; first item yellow with yellow border-bottom (active); click updates URL hash and item color; invalid hash click does not throw.
- **Cards** (`mms_D.1`–`mms_D.6` 313:8467–313:8510): 6 article elements with correct ids; each has Target icon on title, Diamond icon + yellow quantity label, License icon + yellow value label, 1px in-card HR; 5 between-card HRs (`Rectangle 14`); medallion is 336×336 with 2 layered images (`award-bg.png` + wordmark).
- **Signature dual value** (`mms_D.5_Signature 2025`): both "5.000.000 VNĐ"/"cá nhân" and "8.000.000 VNĐ"/"tập thể" render.
- **Kudos banner** (`mms_D1_Sunkudos` 335:12023): "Chi tiết" link present and navigates to /sun-kudos which shows the placeholder.
- **Page health**: zero console errors (the image-aspect-ratio warning is filtered out — not a genuine error).
- **Header nav** (`Frame 476` 178:653): `aria-current="page"` is on "Awards Information" when on /he-thong-giai.

## Files created
```
playwright.config.ts
tests/he-thong-giai.spec.ts
tests/fixtures/auth.ts
```

## How to run
```bash
npm test                  # headless full run
npm run test:headed       # with visible browser
npm run test:report       # open the last HTML report
```

Dev server must be running on port 3000 (`npm run dev` in a separate terminal).

## Notes
- **Migration prerequisite:** tests require the `0002_extend_awards` migration to be applied on the Supabase project. Already applied in the live project.
- **Test user lifecycle:** the fixture creates `playwright-e2e@saa2025.local` on every test, deletes on teardown. Safe to re-run.
- **No code changes** were made to `app/` during testing — all 18 tests passed against the current implementation (after the design-compliance fixes from earlier this session).

## Unresolved questions
None.
