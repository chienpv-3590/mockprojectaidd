---
id: 260526-0816-award-system-page-momorph
title: Implement Award System page (/he-thong-giai) from MoMorph design + backend
status: completed
created: 2026-05-26
mode: momorph
blockedBy: []
blocks: []
relatedPlans:
  - 260525-1151-login-page-momorph     # completed; provides Supabase SSR + auth context (reused)
  - 260525-1429-home-page-momorph      # completed; provides Header/Footer + `awards` table (extended here)
  - 260525-1611-home-ui-major-gaps     # completed; ships per-award themed thumbs at /home/awards/*.png
---

# Award System page (MoMorph) + backend

## Goal
Build `/he-thong-giai` — the SAA 2025 Award System detail page. Authenticated user lands on a single scrollable page showing a hero, sticky 6-item navigation menu (left), 6 award detail cards (right) with image / title / description / quantity / value, and a Sun* Kudos promo banner with `Chi tiết` CTA. Click menu → smooth-scroll to section + active highlight; scroll-spy syncs active item back to menu. Header `Award Information` nav item wired with dynamic active state.

## MoMorph refs
- Award System screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- screenId: `zFYDgyj_pD`
- Clarifications: [clarifications.md](./clarifications.md)

## Stack
Next.js 16 (App Router, RSC) · React 19 · Tailwind 4 · TypeScript · `@supabase/ssr` · `@supabase/supabase-js` · Supabase Postgres + RLS · Montserrat (already loaded)

## Two-Track Phase Layout
Track A (UI) is parallel-runnable with Track B (backend + route + nav). No `blockedBy` between them. Integration phase merges them.

| Phase | Track | Title | Status |
|-------|-------|-------|--------|
| 01 | A | [Award System screen UI from MoMorph](./phase-01-track-a-award-system-ui.md) | completed |
| 02 | B | [Extend awards schema + re-seed](./phase-02-extend-awards-schema-and-seed.md) | completed |
| 03 | B | [Create /he-thong-giai route + auth gate](./phase-03-create-route-and-auth-gate.md) | completed |
| 04 | B | [Placeholder /sun-kudos route + dynamic header nav](./phase-04-sun-kudos-placeholder-and-header-nav.md) | completed |
| 05 | I | [Integration — wire UI to DB + scroll-spy + tests](./phase-05-integration-and-tests.md) | completed |

## Acceptance (whole plan)
- `/he-thong-giai` renders for authenticated users; unauthenticated → redirect to `/login` (TC ID-0, ID-1).
- 6 award cards display correct title / description / quantity+unit / value(s) from DB (TC ID-6).
- Left menu: 6 items in order; click → smooth scroll + active highlight (yellow + underline) (TC ID-5, ID-9, ID-11); hover highlight (TC ID-10); scroll-spy updates active item.
- Signature 2025 card shows both `5.000.000 VNĐ (cho giải cá nhân)` and `8.000.000 VNĐ (cho giải tập thể)`.
- Sun* Kudos banner with `Chi tiết` button → navigates to `/sun-kudos` placeholder (TC ID-12).
- Header `Award Information` link active on this page; `Sun* Kudos` nav link points to `/sun-kudos`.
- Mobile (<lg): menu collapses to horizontal pill row above content; cards single-column with image on top.
- No JavaScript errors on invalid section anchors (TC ID-13).

## Out of scope
- EN translations / real i18n.
- Real Sun* Kudos detail page content (only placeholder route).
- Award nomination/voting flows.
- Awards admin CRUD UI.
- Awards table breakdown column for any award other than Signature 2025.

## Key dependencies
- Supabase project + schema (existing). New migration `0002_extend_awards.sql` adds columns; `seed.sql` rewritten to populate them.
- Existing Header/Footer components (reused; header nav array tweaked).
- Existing `/home/awards/*.png` themed thumbnails (reused; no new media fetch).

## Completion notes

All 5 phases merged and shipped. Build PASS. Test coverage: 14/14 TC PASS (ID-0 through ID-14 static validation); no automated test harness, all manual.

**Tester report (260526-0911):** 14 PASS, 0 FAIL. Build succeeds, lint clean (outside .claude). All TC code paths verified present and correct. Mobile responsiveness CSS-defined but not visually verified (NEEDS-MANUAL).

**Reviewer report (260526-0911):** APPROVED_WITH_CONCERNS, 7.8/10. Zero critical issues (no data loss, no auth bypass, no crash). Two high-priority items: H-1 (pre-existing OAuth `?next=` param ignored across all auth routes — deferred to separate plan) and H-2 (scrollbar-hide utility undefined — fixed inline in app/globals.css this session). Six non-critical findings for next sprint (dual observer mounts, aria-current semantic, file size modularization, redundant sort, stale comment, header slot parity).

**Inline fix applied:** app/globals.css — added `@utility scrollbar-hide` CSS block to hide mobile horizontal scrollbar, resolving H-2.
