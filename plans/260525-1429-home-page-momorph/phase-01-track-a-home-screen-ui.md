---
phase: 01
track: A
title: Home screen UI from MoMorph
status: completed
---

# Phase 01 — Track A: Home screen UI

**Runner:** `tkm:momorph-implement-design` skill at `/tkm:takumi` time, OR direct implementation with bash-curl MCP bypass (same pattern as login plan). Don't pre-code here.

## MoMorph refs
- Home screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- screenId: `i87tDx10uM`
- Clarifications: [clarifications.md](./clarifications.md)
- Design data already fetched to `research/`: overview.json, media_files.json, media_nodes.json, specs.txt (46 items), test_cases.txt (62 cases), preview.png

## Goal
Pixel-perfect static UI at `app/page.tsx` (replacing boilerplate). Async Server Component for top-level (reads session in Phase 04). Component breakdown to respect the project's "files under 200 lines" rule.

## Component layout (proposed; modularize as needed)
```
app/page.tsx                          # root — composes all sections
app/_components/home/Header.tsx       # logo, nav, language, notification, user (user wired in Phase 04)
app/_components/home/Hero.tsx         # Root Further branding + countdown (countdown wired in Phase 04) + 2 CTAs + welcome text
app/_components/home/AwardsGrid.tsx   # 6 award cards in 3×2 grid (responsive)
app/_components/home/AwardCard.tsx    # single card (reused 6×) — thumbnail + title + desc + Chi tiết button
app/_components/home/KudosSection.tsx # Sun* Kudos promo with bg image + CTA
app/_components/home/Footer.tsx       # mms_7_Footer
app/_components/home/FloatingFAB.tsx  # item 6 — bottom-right pill (visual stub)
public/home/                          # assets: keyvisual.jpg, root.png, further.png, 6 award thumbs, kudos-bg.png, kudos-logo.png, icons (notification, user, pen, language stuff)
```

## Out of Scope
- No Supabase imports, no server actions, no client state (stubs only for handlers).
- Countdown: render placeholder `--:--:--`; Phase 04 supplies the real `<CountdownTimer eventDateIso={...} />` client component.
- User menu: render the icon button + invisible empty dropdown; Phase 05 supplies the real `<UserMenu user={...} />` client component.
- Notification bell: render bell icon stub; Phase 06 supplies the real `<NotificationBell initialNotifications={...} initialUnreadCount={...} />` client component.
- Awards grid: take `awards: Award[]` as a prop — map over it (NOT 6 hardcoded copies). For Phase 01 standalone preview, use a small inline mock array.
- Kudos section: take `receivedCount: number` as a prop — show static copy for Phase 01 preview.
- All nav/CTA/award-detail/kudos-CTA/FAB/language: stub `href="#"` or no-op `onClick`.

## Integration Contract (consumed by Phase 07)
- `Hero` exports a slot for `<CountdownTimer />` (`children` prop or named slot).
- `Header` exports slots for `<UserMenu />` and `<NotificationBell />`.
- `AwardsGrid` accepts `awards: Award[]` prop, renders one `<AwardCard>` per row.
- `KudosSection` accepts `receivedCount: number` prop.
- Asset folder: `public/home/` (general) + `public/home/awards/` (the 6 thumbnails).
- All text content matches MoMorph specs verbatim (Vietnamese).

## Outcome
Built 7 React components (header, hero, awards-grid, award-card, kudos-section, footer, floating-fab) + replaced `app/page.tsx` boilerplate. Downloaded 21 assets from MoMorph (14 general + 7 award thumbs); optimized background PNG (4.4MB) to JPEG (269KB). Components accept data props per contract and render stub interactives for Phase 07 wiring.
