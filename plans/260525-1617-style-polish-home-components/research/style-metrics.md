# Style metrics from MoMorph `get_node`

All metrics from desktop 1512px artboard.

## Header (`2167:9091`)
- Width: 1512px (full bleed)
- Height: 80px
- Padding: 12px 144px (vertical 12, horizontal 144)
- Background: `rgba(16, 20, 23, 0.8)` — dark navy with 80% opacity
- Layout: flex-row, justify-between, items-center

## Header slots
- **A1.1 Logo** — 52×48 (current: matches ✓)
- **A1.7 Language switcher** — 108×56 (current: ~97×36 — bigger needed)
- **A1.6 Notification icon** — 40×40 (current: matches ✓)
- **A1.8 User button** — 40×40 with `border: 1px solid #998C5F` (gold) and `border-radius: 4px` — **SQUARE with gold border, NOT circular** (current: circular — needs change)

## Hero "Bìa" (`2167:9030`)
- Width: 1512px (full bleed)
- Padding: 96px 144px
- Gap between vertical children: 120px
- Layout: flex-col, items-center, justify-center

## Countdown wrapper "Frame 487" (`2167:9031`)
- Size: 1224×596
- Gap between children: 40px
- Flex-col, items-start (NOT centered as I currently have)

## CTA pair "mms_B3_Call-To-Action" (`2167:9062`)
- Size: 570×60
- Gap between 2 buttons: 40px
- Flex-row, items-start

## Award card (e.g. `2167:9075`)
- Size: 336×504 (taller than current — needs height bump)
- Internal gap: 24px
- Flex-col, items-start, padding 0 (gaps separate sections, not internal padding)

## Awards section frame (`3204:10152`)
- Size: 1152×1219
- Padding: 120px 104px
- Border-radius: 8px (!)
- Gap: 32px
- Flex-col, items-center

## Kudos background (`I3390:10349;313:8416`)
- Size: 1120×500
- Border-radius: 16px
- Background image with #0F0F0F dark fill

## Floating FAB (item 6 — spec)
- Pill: 105×64
- Border-radius: full pill
- Yellow bg

## Polish priorities (most impactful → least)
1. **User button shape** — circle → square + gold border. Distinctive in design.
2. **Hero ROOT FURTHER size** — bump from `w-72/96/[28rem]` → `w-96/[32rem]/[40rem]`
3. **Awards section** — border-radius 8px on wrapper, generous padding
4. **Award card** — taller (504px feel), more breathing
5. **Kudos** — border-radius 16px on bg frame, larger logo
6. **Countdown** — gap 40px between boxes
7. **CTA buttons** — gap 40px, padding generous
