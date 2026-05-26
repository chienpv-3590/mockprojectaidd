# Clarifications

## Session 2026-05-26 (planning)
- Q: Route path for /he-thong-giai vs English slug? → A: /he-thong-giai (matches test case TC ID-0 verbatim; consistent with VN-only page content).
- Q: Data source for new award fields (quantity, value, long description)? → A: Extend `awards` table via new migration + re-seed. DB stays source-of-truth.
- Q: Sun* Kudos `Chi tiết` button target — page does not exist? → A: Create placeholder route `/sun-kudos` with "Coming soon" content. Real navigation works, TC ID-12 passes.
- Q: Active-menu detection — click-only or scroll-spy? → A: Click + IntersectionObserver scroll-spy. Click scrolls to section, scroll position updates active item.
- Q: Header nav integration — wire `Award Information` href? → A: Yes. Update to `/he-thong-giai`, compute active from `usePathname()`, also link `Sun* Kudos` to `/sun-kudos`.
- Q: Mobile/responsive layout strategy? → A: Single-column stack below lg breakpoint — left menu becomes horizontal scrollable pill row above cards; cards stack with image on top.
- Q: Signature 2025 dual value (5tr cá nhân + 8tr tập thể) — schema shape? → A: Add nullable JSONB column `value_breakdown` on `awards` table. Array of `{label, amount_text}`. Null for single-value awards.
- Q: i18n (EN) support? → A: VN-only for this plan. Mirror home page; lang switcher stays decorative.
- Q: Auth gate — same redirect to `/login` as home? → A: Yes. TC ID-1 requires redirect for unauthenticated. Reuse existing Supabase SSR pattern from `app/page.tsx`.
- Q: Award detail page hero — full ROOT FURTHER keyvisual like home, or reduced banner? → A: Reduced banner per design — Cover rectangle (top dark band), keyvisual artwork strip with `MM_MEDIA_Root Further Logo` (top-left), then title block (small white "Sun* Annual Awards 2025" + large yellow "Hệ thống giải thưởng SAA 2025"). No countdown, no CTA buttons.
- Q: Award images (336x336) source? → A: Reuse existing seeded `thumbnail_path` (`/home/awards/*.png`) — already shipped, already pixel-aligned with the design themed thumbs per `260525-1611` polish plan.
