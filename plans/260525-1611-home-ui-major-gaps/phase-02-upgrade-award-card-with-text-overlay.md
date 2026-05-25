---
phase: 02
title: Upgrade award card with per-award text overlay on thumbnail
status: completed
---

# Phase 02 — Award card visual upgrade

## Goal
Each of the 6 award cards should match the MoMorph design: shared dark `award-bg.png` background with the per-award stylized text image (`MM_MEDIA_Top Talent`, etc.) overlaid centered on the thumbnail. Remove the redundant `h3` title below (text is now baked into the image).

## Files to modify
- `app/_components/home/award-card.tsx` — restructure thumbnail composition + drop or shrink `h3`

## Current state (problem)
```tsx
<Image src="/home/awards/award-bg.png" fill className="object-cover" />
{award.thumbnail_path && (
  <Image src={award.thumbnail_path} fill className="object-contain p-12" />
)}
// ... below thumbnail ...
<h3 style={TITLE_STYLE}>{award.title_vi}</h3>
```

The text-image overlay logic already exists but is too small (`p-12`) and competes with the `h3` text below — duplicates content.

## Target state
```tsx
<div className="relative aspect-square ...">
  <Image src="/home/awards/award-bg.png" fill className="object-cover" sizes="..." />
  {award.thumbnail_path && (
    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
      <Image
        src={award.thumbnail_path}
        alt={award.title_vi}
        width={280}
        height={80}
        className="h-auto w-auto max-h-[60%] max-w-[80%] object-contain"
      />
    </div>
  )}
</div>
// h3 REMOVED — text is in the overlay image
<div className="flex flex-1 flex-col gap-2 p-5 text-white">
  <p className="flex-1 text-white/75" style={DESC_STYLE}>
    {award.description_vi}
  </p>
  <Link href={`#${award.code}`} ...>Chi tiết →</Link>
</div>
```

## Sizing rules
- Wrapper: `aspect-square` (unchanged)
- Bg: `fill object-cover`
- Overlay text image: centered, `max-h-[60%] max-w-[80%]`, `object-contain` — handles varied aspect ratios (MVP 116×52, Top Talent ~N×35, Top Project Leader 232×64, etc.) without squishing
- Removed: the `<h3>{award.title_vi}</h3>` — text is in the image
- Kept: `<p>{award.description_vi}</p>` (2-line clamp per spec C2.1.3)
- Kept: "Chi tiết →" link

## Description clamping (spec C2.1.3)
Use Tailwind `line-clamp-2` to truncate description at 2 lines with ellipsis.

## Accessibility
- Bg image: `alt=""` (decorative)
- Text overlay image: `alt={award.title_vi}` (was inherent in the removed h3; preserve via alt)
- Card link: aria-label hint via the inner Link

## Success Criteria
- 6 cards each show distinct stylized title image overlaid on the shared dark bg.
- Description line-clamps at 2 lines.
- No duplicate title (image OR h3, not both).
- Build + lint pass.

## Risks
- Text-image aspect ratios vary significantly (MVP is wide/short, Top Project Leader is taller). The `max-h-[60%] max-w-[80%]` clamp should accommodate both. If MVP looks too squished, allow `max-h-[40%]` specifically for short text.
- The award-bg.png is 336×336, will scale fine at any card size.

## Out of Scope
- Hover animation on overlay text (e.g. subtle glow on hover)
- Per-award background color tint

## Outcome
Modified `app/_components/home/award-card.tsx` to overlay per-award text images centered on shared dark background at max-h-55% max-w-78% with object-contain. Removed redundant h3 title; added line-clamp-2 to description. All 6 cards now display distinct stylized text images with accessibility improvements via aria-label on detail link.
