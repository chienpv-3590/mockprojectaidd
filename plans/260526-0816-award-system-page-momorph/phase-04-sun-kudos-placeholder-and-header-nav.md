---
phase: 04
track: B
status: completed
runnable_concurrently_with: [01, 02, 03]
---

# Phase 04 — Track B: Placeholder /sun-kudos route + dynamic header nav

## Context Links
- Plan: [plan.md](./plan.md)
- Clarifications: [clarifications.md](./clarifications.md)
- Existing header: `app/_components/home/header.tsx`

## Overview
- **Priority:** Medium
- **Status:** Pending
- Two small, related deliverables: (1) a placeholder `/sun-kudos` route so the Kudos banner CTA and header `Sun* Kudos` link both go somewhere real, (2) header nav becomes pathname-aware (dynamic `active` instead of the current hardcoded array).

## Requirements
- `app/sun-kudos/page.tsx` renders a simple "Coming soon" placeholder, gated by auth (same pattern as home).
- Header nav array updates: `Award Information` → `/he-thong-giai`, `Sun* Kudos` → `/sun-kudos`. `About SAA 2025` stays `#` for now.
- `active` for each nav item is derived from `usePathname()` (client component) — exact match.
- Mobile/desktop layouts unchanged visually; only the hrefs + active logic change.

## Architecture
- Header is currently mostly static; the nav `<ul>` lives inside it. Convert it (or just the nav segment) to use `usePathname()` from `next/navigation`. If the existing header is a server component, split the nav into a small client subcomponent `nav-links.tsx`.
- `/sun-kudos` mirrors `/he-thong-giai`'s auth gate but renders minimal body.

## Related Code Files
**Create:**
- `app/sun-kudos/page.tsx`
- `app/_components/home/nav-links.tsx` (only if header is RSC and can't call `usePathname` itself)

**Modify:**
- `app/_components/home/header.tsx` — nav array hrefs + active derivation

## Implementation Steps
1. Inspect `app/_components/home/header.tsx` to confirm whether it's currently a client or server component. Decide split.
2. If server component:
   - Extract `<NavLinks />` into `app/_components/home/nav-links.tsx` with `"use client"` and `usePathname()`.
   - Header imports and renders `<NavLinks />`.
3. Nav array:
   ```ts
   const NAV = [
     { label: 'About SAA 2025',    href: '#' },
     { label: 'Award Information', href: '/he-thong-giai' },
     { label: 'Sun* Kudos',        href: '/sun-kudos' },
   ];
   ```
   Render with `active = pathname === item.href`. Apply existing yellow/underline style when active.
4. Create `app/sun-kudos/page.tsx`:
   ```tsx
   import { redirect } from 'next/navigation';
   import { createServerClient } from '@/lib/supabase/server';
   import { Header } from '@/app/_components/home/header';
   import { Footer } from '@/app/_components/home/footer';

   export const metadata = { title: 'Sun* Kudos — SAA 2025' };

   export default async function SunKudosPage() {
     const supabase = await createServerClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect('/login?next=/sun-kudos');
     return (
       <>
         <Header />
         <main className="bg-[#00101A] px-6 py-32 text-center text-white">
           <h1 className="text-3xl font-semibold text-[#FFEA9E]">Sun* Kudos</h1>
           <p className="mt-4 text-white/70">Coming soon — chi tiết phong trào ghi nhận sẽ sớm có mặt.</p>
         </main>
         <Footer />
       </>
     );
   }
   ```
5. `npm run build` + manual check: header active state highlights correctly on `/`, `/he-thong-giai`, `/sun-kudos`.

## Todo
- [x] Header nav hrefs updated to real routes
- [x] `active` derives from `usePathname()`
- [x] `app/sun-kudos/page.tsx` created with auth gate + Coming soon
- [x] `npm run build` passes
- [x] Manual smoke: navigate `/` → `/he-thong-giai` → `/sun-kudos`, active state correct on each

## Success Criteria
- TC ID-2 passes (navigation from main menu to `/he-thong-giai`).
- TC ID-12 passes after Phase 05 wires Kudos banner CTA (`/sun-kudos` exists, not 404).
- Header active highlight follows current pathname; no visual regression on home.

## Risk Assessment
- **Risk:** Splitting header into client subcomponent breaks RSC tree. **Mitigation:** Keep split narrow — only the nav list becomes client; logo + lang switcher + user menu stay in their existing components.
- **Risk:** `usePathname()` returns trailing-slash variant. **Mitigation:** Normalize with `pathname?.replace(/\/$/, '') || '/'` before comparing.

## Security Considerations
- `/sun-kudos` is auth-gated. Same trust model.

## Next Steps
- Phase 05 integration uses these routes from inside the Award System UI (Kudos banner → `/sun-kudos`).
