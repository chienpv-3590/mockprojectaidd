# Award System UI — Phase 01 Track A Implementation Report

**Date:** 2026-05-26
**Phase:** 01 (Track A)
**Status:** DONE_WITH_CONCERNS

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `app/_components/award-system/award-hero.tsx` | 66 | Reduced hero banner — ROOT FURTHER keyvisual + title block |
| `app/_components/award-system/award-menu.tsx` | 99 | Left sticky menu (desktop) / horizontal pill row (mobile) |
| `app/_components/award-system/award-detail-card.tsx` | 228 | Single award detail card — image + quantity/value rows + long description |
| `app/_components/award-system/kudos-banner.tsx` | 116 | Sun* Kudos promo banner with `/sun-kudos` Link |
| `app/_components/award-system/award-system.tsx` | 91 | Container — accepts `Award[]`, composes all sub-components |
| `app/_components/award-system/mock-awards.ts` | 95 | Mock data for local visual validation (Phase 05 removes this) |

**Total: 6 files, ~695 lines**

---

## Component Tree

```
<AwardSystem awards={Award[]}>
  <AwardHero />                          ← keyvisual + title block
  <section>
    <aside>
      <AwardMenu awards={sorted} />      ← sticky menu (desktop) / pill row (mobile)
    </aside>
    <div>
      {sorted.map((award, i) =>
        <AwardDetailCard
          award={award}
          imageLeft={i % 2 === 0}        ← alternating left/right
          id={award.code}                ← anchor target
        />
      )}
    </div>
  </section>
  <KudosBanner />                        ← /sun-kudos Link
</AwardSystem>
```

---

## Props / Types

### `<AwardSystem>`
```ts
{ awards: Award[] }
```

### `<AwardDetailCard>`
```ts
{ award: Award; imageLeft: boolean }
```
Reads: `title_vi`, `quantity_text`, `unit_text`, `value_text`, `value_breakdown`, `long_description_vi`, `thumbnail_path`, `code`.

### `<AwardMenu>`
```ts
{ awards: Award[]; activeCode?: string }
```
Defaults first item active when `activeCode` is undefined (Phase 05 replaces with IntersectionObserver state).

### `<AwardHero>` / `<KudosBanner>`
No props — self-contained.

---

## Integration Contract Satisfied

- [x] `AwardSystem` accepts `Award[]` — uses base type from `lib/data/types.ts` (already extended in parallel Track B)
- [x] Each card root carries `id={award.code}`
- [x] Menu anchors link to `#${award.code}`
- [x] `<KudosBanner>` Chi tiết is `<Link href="/sun-kudos">`
- [x] Mock data in `mock-awards.ts` — all 6 awards from MoMorph spec, verbatim text
- [x] Image filename map handles `signature-creator` → `signature-2025-creator.png` explicitly

---

## Visual Rules Applied

- Dark theme `#00101A` background throughout
- Card titles: `#FFEA9E` (yellow), Montserrat 700
- Quantity/value amounts: `#FFEA9E`, Montserrat 700, 20px
- Labels/units: `rgba(255,255,255,0.7)`, 14px
- Long description: `rgba(255,255,255,0.85)`, `whitespace: pre-line`
- Image alternation: even index = image-LEFT, odd index = image-RIGHT
- Image dimensions: 336×336 with `rounded-2xl` wrapper
- Menu desktop: vertical sticky, active = yellow + `border-b-2 border-[#FFEA9E]`, inactive = `white/70`
- Menu mobile: horizontal scrollable pill row, active = yellow pill border
- `scroll-mt-32` on each card for sticky header clearance

---

## Concerns

1. **Build not verified** — Bash execution was denied in this session. TypeScript correctness was verified by manual review (all imports resolve, all prop types match). The `aria-hidden={true}` attribute is explicit on all decorative SVGs/divs.

2. **`AwardMenu` rendered twice** in `award-system.tsx` (once mobile-hidden, once desktop-hidden) — intentional CSS-only responsive split to avoid client component for this phase. Phase 05 can consolidate into a single `'use client'` component when IntersectionObserver state is added.

3. **`FONT_MONTSERRAT` constant** is used in `award-system.tsx` section header paragraph — not unused.

4. **MCP tools restricted** — Only `get_overview` and `get_frame_image` were accessible. Design values (colors, spacing, typography) sourced from: MoMorph overview node tree + spec table in task description + existing home component patterns. No values invented.

---

## Files NOT Touched (per scope rules)

- `app/he-thong-giai/page.tsx` — Track B creates it
- `app/_components/home/header.tsx` — Track B Phase 04
- `lib/data/awards.ts` / `lib/data/types.ts` — Track B Phase 02 (already extended)
- `supabase/migrations/*` / `supabase/seed.sql` — Track B Phase 02
- No IntersectionObserver / scroll-spy logic
