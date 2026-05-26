# Review: Award System Page — Plan 260526-0816

**Date:** 2026-05-26
**Reviewer:** reviewer agent
**Plan:** `plans/260526-0816-award-system-page-momorph/`

---

## Score Table

| Dimension | Score | Notes |
|-----------|-------|-------|
| Correctness | 7.5/10 | Auth gate solid; OAuth next-param lost; dual-observer state; scrollbar-hide silently broken |
| Security | 9.0/10 | RLS correct; server-side auth; no injection surface; no PII |
| Maintainability | 7.5/10 | `award-detail-card.tsx` > 200 lines; duplicate `<AwardMenu>` mount; stale comment in `award-system.tsx` |
| Test Coverage | 6.5/10 | No automated tests shipped; TC ID-0 through ID-14 are manual-only; mock-awards.ts has text drift vs seed |
| Documentation | 8.5/10 | JSDoc on all components; plan-comment integration contracts accurate |
| **Overall** | **7.8/10** | |

Auto-approval threshold (≥9.5 overall, 0 critical): **NOT MET**

---

## Verdict: APPROVED_WITH_CONCERNS

No blocking security holes or data loss paths. Two functional defects that degrade UX but do not expose data or crash the app. Three non-critical findings. Ship is viable after addressing the two high-priority items.

---

## Critical Issues (blocking before delivery)

None — no data loss, no auth bypass, no crash path.

---

## High Priority (fix before next sprint)

### H-1 — OAuth post-login redirect ignores `next` param

**File:** `app/login/actions.ts` line 14

```ts
redirectTo: `${origin}/auth/callback?next=/`,  // ← hardcoded "/"
```

The pages redirect to `/login?next=/he-thong-giai` and `/login?next=/sun-kudos`, but the Google OAuth action ignores the `next` query parameter and hardcodes `/` in the `redirectTo`. After successful Google sign-in the user always lands on `/`, not the page they tried to visit.

**Fix:** Read `next` from the current URL in the action and forward it:
```ts
// in actions.ts (server action — can read headers for the referrer URL)
const nextParam = /* read from form data or cookies set by login page */ || "/";
redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextParam)}`
```

This is an existing pre-plan bug exposed by the new auth-gated routes. TC ID-1 passes (redirect to login) but the full round-trip (login → back to intended page) silently fails.

---

### H-2 — `scrollbar-hide` class is undefined — mobile horizontal scroll bar visible

**File:** `app/_components/award-system/award-menu.tsx` line 94

```tsx
className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:hidden"
```

`scrollbar-hide` is not a built-in Tailwind 4 utility, not defined in `globals.css`, and no plugin (`tailwind-scrollbar-hide` or equivalent) appears in `package.json`. The class is silently ignored — the horizontal scrollbar is visible on mobile, which is a visual regression against the design spec.

**Fix (option A):** Add to `globals.css`:
```css
@utility scrollbar-hide {
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

**Fix (option B):** Replace with inline Tailwind 4 approach: `[&::-webkit-scrollbar]:hidden` (Tailwind 4 supports arbitrary variants).

---

## Non-Critical Findings (note for future)

### M-1 — Dual `<AwardMenu>` mount creates two independent IntersectionObservers

**File:** `app/_components/award-system/award-system.tsx` lines 62–68

```tsx
<div className="mb-8 lg:hidden">
  <AwardMenu awards={sorted} />      {/* observer instance A */}
</div>
<div className="hidden lg:block">
  <AwardMenu awards={sorted} />      {/* observer instance B */}
</div>
```

Both instances run simultaneously in the DOM (CSS `hidden` hides visually but the node is live). Each has its own `activeCode` state and its own `IntersectionObserver` observing the same 6 card elements. They don't conflict (both update independently and are visually separated by breakpoint), but it is 2× the observer callbacks and 2× the React state for no reason.

**Preferred fix:** Lift `activeCode` state into a single controller and pass it down as a prop, or use a single `<AwardMenu>` with CSS-only breakpoint variant switching inside. Not urgent since both instances are hidden at their respective breakpoints, but it is wasted work.

---

### M-2 — `aria-current="true"` on anchor menu items — should be `"location"`

**File:** `app/_components/award-system/award-menu.tsx` lines 103, 133

```tsx
aria-current={isActive ? "true" : undefined}
```

For in-page anchor navigation (not page-level navigation), the correct WAI-ARIA value is `aria-current="location"`. `"true"` is a generic token with no semantic meaning for navigation contexts. `NavLinks` correctly uses `"page"` for the top-level nav. Screen readers announce `"true"` as-is without adding context.

**Fix:** `aria-current={isActive ? "location" : undefined}`

---

### L-1 — `award-detail-card.tsx` exceeds 200-line project rule

**File:** `app/_components/award-system/award-detail-card.tsx` — **269 lines**

Project rule requires files ≤200 lines. `TrophyIcon` and `ValueIcon` (inline SVG helpers, ~20 lines each) plus the `getAwardImage` utility could be extracted into a shared `award-icons.tsx` or `award-utils.ts` to bring the card component under limit.

---

### L-2 — Redundant sort in `AwardSystem` (server component)

**File:** `app/_components/award-system/award-system.tsx` line 21

```ts
const sorted = [...awards].sort((a, b) => a.display_order - b.display_order);
```

`getAwards()` already `.order("display_order", { ascending: true })` at the DB level. The client-side sort is a defensive no-op on every render. Remove to simplify; trust the DAL contract.

---

### L-3 — Stale comment implies `activeCode` wiring is pending

**File:** `app/_components/award-system/award-system.tsx` lines 15–17

```ts
 *   - activeCode prop wired to IntersectionObserver state in Phase 05.
```

Phase 05 is complete — the IntersectionObserver state now lives in `AwardMenu` itself. The comment implies future work that has already been done. Update or remove.

---

### L-4 — `unit_text` text drift between seed and mock

`seed.sql` → `'Cá nhân hoặc Tập thể'` (signature-creator)
`mock-awards.ts` → `"Cá nhân/Tập thể"`

No runtime impact since `mock-awards.ts` is not imported in production paths, but confusing if mock is used for snapshot testing later. Align them.

---

### L-5 — `sun-kudos` page missing notification and user slots

**File:** `app/sun-kudos/page.tsx` line 18

```tsx
<Header languageSlot={<LanguageSwitcher />} />
```

The `he-thong-giai` page passes `notificationSlot` and `userSlot` to `<Header>`. The `sun-kudos` page omits them — notification bell and user avatar won't render on the Kudos placeholder page for an authenticated user. Likely an oversight given the page is a placeholder, but it creates inconsistent header UX.

---

## Test-Case Coverage Assessment

| TC | Description | Status |
|----|-------------|--------|
| ID-0 | Authenticated → page renders | Code path correct; not automated |
| ID-1 | Unauthenticated → redirect `/login` | Code path correct; round-trip broken (H-1) |
| ID-2 | Nav `Award Information` reaches page | Implemented |
| ID-3/4/5 | Visual GUI checks | No automated visual test |
| ID-6 | 6 cards with correct data from DB | Wired correctly |
| ID-7/8 | Visual checks | No automated test |
| ID-9/11 | Click menu → scroll + active | Implemented in `award-menu.tsx` |
| ID-10 | Hover highlight via CSS | Implemented |
| ID-12 | Kudos `Chi tiết` → `/sun-kudos` | `<Link href="/sun-kudos">` — correct |
| ID-13 | Invalid section click — no JS error | Silent no-op guard present |
| ID-14 | `/sun-kudos` not 404 | Route exists |

No Playwright tests exist. All verification is manual. The plan referenced Playwright as "if available" which was not pursued.

---

## Security Assessment

- RLS: `awards` table has `using (true)` — readable by anyone. Appropriate for public catalog data. New columns inherit same policy (no migration-level RLS change needed).
- Auth gate: `supabase.auth.getUser()` called server-side — not relying on a JWT claim alone. Correct pattern.
- Anchor injection: `id={award.code}` and `href={#award.code}` — `code` is a DB-controlled slug (`text unique`), not user input. No XSS surface.
- No secrets in code. No stack traces exposed to client.
- `seed_demo_data_for_current_user()` is `SECURITY DEFINER` with `auth.uid()` guard — correctly prevents cross-user data seeding.

---

## Architecture / Style Assessment

- RSC boundary correct: `AwardSystem` and `AwardDetailCard` are server components; `AwardMenu` (needs `useEffect`, `useState`) is `"use client"`. Clean split.
- `Award[]` passed as prop from server → client is fully serializable (no `Date`, no `Function`, no `Symbol` fields). Safe.
- YAGNI satisfied: no speculative features added.
- Kebab-case file naming: compliant.
- `mock-awards.ts` is not imported in any production code path — safe dead file; useful for local dev.

---

## Files Reviewed

| File | Lines | Role |
|------|-------|------|
| `app/he-thong-giai/page.tsx` | 51 | Route + auth gate + data fetch |
| `app/sun-kudos/page.tsx` | 36 | Placeholder route |
| `app/_components/award-system/award-system.tsx` | 90 | Container (RSC) |
| `app/_components/award-system/award-menu.tsx` | 156 | Client menu + scroll-spy |
| `app/_components/award-system/award-detail-card.tsx` | 269 | Card (RSC) |
| `app/_components/award-system/award-hero.tsx` | 70 | Hero (RSC) |
| `app/_components/award-system/kudos-banner.tsx` | 127 | Kudos banner (RSC) |
| `app/_components/award-system/mock-awards.ts` | 102 | Dev-only mock data |
| `app/_components/home/nav-links.tsx` | 55 | Client nav with usePathname |
| `app/_components/home/header.tsx` | 40 | Header (RSC) |
| `app/_components/home/footer.tsx` | 49 | Footer (RSC) |
| `lib/data/types.ts` | 29 | Award type + AwardValueBreakdown |
| `lib/data/awards.ts` | 17 | DAL — getAwards() |
| `supabase/migrations/0002_extend_awards.sql` | 16 | Schema extension |
| `supabase/seed.sql` | 126 | Re-seed with detail fields |
| `app/auth/callback/route.ts` | 20 | OAuth callback (pre-existing) |
| `app/login/actions.ts` | (partial) | Google OAuth action (pre-existing) |

---

## Recommended Actions (priority order)

1. **[H-1]** Fix `signInWithGoogle` action to forward `next` param through OAuth `redirectTo` — affects all auth-gated pages, not just this plan.
2. **[H-2]** Define `scrollbar-hide` utility in `globals.css` (one `@utility` block) — 3-line fix.
3. **[M-1]** Consolidate dual `<AwardMenu>` into single mount with internal breakpoint logic — reduces observer count from 2 to 1.
4. **[M-2]** Change `aria-current="true"` to `aria-current="location"` in `award-menu.tsx`.
5. **[L-1]** Extract SVG icons + `getAwardImage` from `award-detail-card.tsx` to bring under 200 lines.
6. **[L-2]** Remove redundant sort in `AwardSystem`.
7. **[L-3]** Update stale comment about Phase 05 wiring.
8. **[L-4]** Align `unit_text` for `signature-creator` between seed and mock.
9. **[L-5]** Add `notificationSlot` + `userSlot` to `sun-kudos/page.tsx` header.

---

## Unresolved Questions

1. **H-1 fix ownership:** The `signInWithGoogle` action is pre-plan code. Does the login page need to be updated to pass `next` into a hidden form field so the server action can read it? Or is this tracked in a separate plan?
2. **Playwright:** TC ID-3/4/5/7/8 are visual screenshot tests referenced in phase-05. Were they explicitly descoped or just not run? If visual regression is required for sign-off, these TCs are open.
3. **`scrollbar-hide` in home page:** Is it used elsewhere? A global `@utility` fix in `globals.css` would cover all usages.
