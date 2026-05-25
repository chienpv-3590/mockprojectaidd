---
phase: 01
title: Build B4 "Root Further" description section
status: completed
---

# Phase 01 — B4 "Root Further" description section

## Goal
New component rendering MoMorph spec **B4 `mms_B4_content`**. Decorative "ROOT" + "FURTHER" background typography (using existing `.png` assets at low opacity), multi-paragraph Vietnamese description, English quote highlighted.

## Files to create
- `app/_components/home/root-further-description.tsx` — server component, no client state

## Files to modify
- `app/page.tsx` — import + render `<RootFurtherDescription />` between `<Hero>` and `<AwardsGrid>`

## Component shape
```tsx
// Layout:
// - Dark navy section (#00101A), large vertical padding
// - Background layer: ROOT (top-left) + FURTHER (bottom-right) as huge faded images, absolute, very low opacity, pointer-events-none
// - Foreground: centered max-width container
//   - Body: 3-4 short paragraphs of Vietnamese theme description (placeholder copy w/ operator-replace note)
//   - Quote: "A tree with deep roots fears no storm" — italic, larger, lighter color, with attribution "— English proverb"
```

## Content (placeholder — operator to replace)
```
Đứng giữa thế giới đầy biến chuyển, chúng ta vẫn tìm được điểm tựa nơi gốc rễ —
nơi những giá trị mà mỗi cá nhân và đội nhóm Sun* không ngừng vun đắp qua thời gian.

ROOT FURTHER là lời nhắc về hành trình của chúng ta: bám rễ vững chắc vào nền tảng
văn hóa, kỹ năng và sự tử tế, để vươn xa hơn nữa trong từng dự án và từng cơ hội.

SAA 2025 vinh danh những con người, những đội nhóm và những câu chuyện đã sống đúng
tinh thần ấy — kiên định với gốc rễ, dũng cảm với tương lai.
```

Quote:
```
"A tree with deep roots fears no storm."
— English proverb
```

## Asset use
- `/home/root-text.png` (189×67) → scaled up ~3-4× as background, low opacity (~0.08-0.12), positioned top-left
- `/home/further-text.png` (290×67) → same treatment, positioned bottom-right
- Both `<Image>` from next/image with `priority={false}` (below-the-fold)

## Typography
- Body paragraphs: Montserrat, 16-18px, line-height 28-32px, white/85 opacity
- Quote: Montserrat italic, 24px (sm) / 28px (md), white/95
- Attribution: Montserrat 14px, white/60

## Success Criteria
- Section renders between hero and awards.
- Background "ROOT" and "FURTHER" visible as decorative typography (faded).
- 3 paragraphs of Vietnamese + 1 English quote with attribution.
- Build + lint pass.

## Risks
- Background images at low opacity may look like a render bug on some monitors. Use `mix-blend-mode: lighten` or `overlay` if needed.
- Spec C2.1.3 says max 2 lines + ellipsis — but that's for award card desc, not B4. B4 has no truncation per spec.

## Out of Scope
- Real Vietnamese copy from design owner (placeholder copy used)
- Animation / fade-in on scroll

## Outcome
Created `app/_components/home/root-further-description.tsx` as a server component rendering the B4 section between hero and awards grid. Decorative ROOT/FURTHER background images layered at opacity 0.08–0.10; 3 paragraphs of Vietnamese brand description + English proverb quote with proper attribution.
