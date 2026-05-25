---
phase: 01
title: Survey design via MoMorph get_node for key elements
status: completed
---

# Phase 01 — Survey element styles

## Goal
Pull exact style metrics from MoMorph for the elements being restyled in Phase 02. Avoid guessing dimensions; ground every Tailwind/CSS change in real Figma values.

## Method
Use the bash-curl MoMorph MCP bypass (same pattern as parent plans). Call `get_node` for each target node ID from the overview, save shapes to `plans/260525-1617-style-polish-home-components/research/`.

## Target node IDs (from `plans/260525-1429-home-page-momorph/research/overview.json`)
- **Header `mms_A1_Header`** — id `2167:9091` (already known: contains logo/lang/noti/user slot dimensions)
  - Slot A1.6 notification icon: `I2167:9091;186:2101` — verify 40×40
  - Slot A1.7 language: `I2167:9091;186:1696` — verify
  - Slot A1.8 user button: `I2167:9091;186:1597` — verify 40×40
- **Hero `Bìa`** — id `2167:9030` and children
  - Frame 487 (countdown wrapper): `2167:9031`
  - CTA frame `mms_B3_Call-To-Action`: `2167:9062`
  - ROOT FURTHER text: `2167:9091` is header, look for `mms_3.5_Keyvisual` `2167:9027` and its image child
- **B2 event info** — search nodes for "Thời gian" / "Địa điểm" text
- **Floating FAB (item 6)** — search by name keyword "6_" or look for INSTANCE outside header/footer with `mms_6` prefix
- **Footer `mms_7_Footer`** — id (search by name)
- **Kudos section `D1`/`D2`** — search by name "Kudos" or `D2`

## Procedure
1. `get_overview(fileKey, screenId)` → already fetched in research/. Re-read to find missing node IDs.
2. For each target ID: `get_node(fileKey, screenId, nodeId)` → save to research/{name}.json (just the `styles` block)
3. Compose a single markdown summary `research/style-metrics.md` mapping component → element → metric (font-size, line-height, width, height, padding, etc.)

## Output
- `research/style-metrics.md` — single source of truth for Phase 02
- One JSON per queried node under `research/nodes/`

## Success Criteria
- For each of the 6 gaps in the plan: at least one Figma metric documented.
- Phase 02 can write Tailwind classes by reading the markdown without re-querying.

## Risks
- Some node IDs may not exist (design hierarchy might differ). Skip gracefully — log as "not found, fall back to visual eyeball".
- Signed URLs in fresh `get_media_files` may not be needed — we already have all assets locally.

## Out of Scope
- Modifying any component code in this phase (read-only survey).

## Outcome
Fetched 12 node styles via MoMorph `get_node`: header logo/nav/buttons, hero ROOT FURTHER image, countdown timer boxes, event info labels, FAB pill, awards grid, kudos section logo, footer. Compiled metrics into `research/style-metrics.md` covering dimensions, typography (font-size, line-height, tracking), spacing (padding, gap), and colors for Phase 02 implementation.
