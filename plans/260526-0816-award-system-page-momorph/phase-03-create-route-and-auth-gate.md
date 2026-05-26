---
phase: 03
track: B
status: completed
runnable_concurrently_with: [01, 02, 04]
---

# Phase 03 — Track B: Create /he-thong-giai route + auth gate

## Context Links
- Plan: [plan.md](./plan.md)
- Clarifications: [clarifications.md](./clarifications.md)
- Auth pattern reference: `app/page.tsx` (home; same SSR + redirect pattern)
- Supabase server client: existing `@/lib/supabase/server` (used by home)

## Overview
- **Priority:** High
- **Status:** Pending
- Create the route shell. Server component fetches awards + checks auth + renders the Track-A UI container. No interactive logic in this phase — that lands in integration (Phase 05).

## Requirements
- New route `app/he-thong-giai/page.tsx` is a server component.
- Unauthenticated user → `redirect('/login?next=/he-thong-giai')` (TC ID-1).
- Authenticated user → page renders Header + UI container + Footer.
- Awards fetched server-side via existing `getAwards(supabase)`.
- Page metadata: `<title>Hệ thống giải thưởng SAA 2025</title>`.

## Architecture
```
app/
  he-thong-giai/
    page.tsx           ← server component, auth + data + render
  _components/
    award-system/      ← lives here once Phase 01 UI lands; route imports container
      ...              ← (created in Phase 01)
```

- Page composition mirrors `/`: shared `<Header />` + `<AwardSystem awards={awards} />` + `<Footer />`.
- No new global layout — root layout already provides fonts + body styling.

## Related Code Files
**Create:**
- `app/he-thong-giai/page.tsx`

**Read (no edit):**
- `app/page.tsx` — copy SSR + auth pattern
- `lib/data/awards.ts` — already-extended (Phase 02) DAL

## Implementation Steps
1. Create `app/he-thong-giai/page.tsx`:
   ```tsx
   import { redirect } from 'next/navigation';
   import { createServerClient } from '@/lib/supabase/server';
   import { getAwards } from '@/lib/data/awards';
   import { Header } from '@/app/_components/home/header';
   import { Footer } from '@/app/_components/home/footer';
   import { AwardSystem } from '@/app/_components/award-system/award-system';

   export const metadata = { title: 'Hệ thống giải thưởng SAA 2025' };

   export default async function HeThongGiaiPage() {
     const supabase = await createServerClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect('/login?next=/he-thong-giai');
     const awards = await getAwards(supabase);
     return (
       <>
         <Header />
         <AwardSystem awards={awards} />
         <Footer />
       </>
     );
   }
   ```
   (Concrete import paths must match the project's existing aliases — verify against `app/page.tsx`.)
2. Skip `<AwardSystem>` import until Phase 01 lands → use a TODO placeholder or stage this file *after* Phase 01's container exists. Safe to land via Phase 05 integration if needed.
3. Run `npm run build` to confirm route compiles.
4. Manually browse to `/he-thong-giai` (signed out) → redirects. Sign in → renders.

## Todo
- [x] `app/he-thong-giai/page.tsx` created
- [x] Unauthenticated visit redirects to `/login`
- [x] Authenticated visit renders Header + container + Footer
- [x] `npm run build` passes

## Success Criteria
- TC ID-0 passes: authenticated user → page renders.
- TC ID-1 passes: unauthenticated → redirect to `/login`.
- TC ID-2 passes: navigation from header `Award Information` reaches this page (depends on Phase 04).

## Risk Assessment
- **Risk:** `<AwardSystem>` import path race against Phase 01. **Mitigation:** Phase 05 integration coordinates; if Phase 03 ships first, leave a stub return + integrate fully in Phase 05.
- **Risk:** Auth helper signature drift from home. **Mitigation:** Copy exactly from `app/page.tsx`.

## Security Considerations
- Server-side auth check via `supabase.auth.getUser()` — same trust model as home.
- No data exposed beyond what home already exposes.

## Next Steps
- Phase 04: wire header `Award Information` so users can reach this route from the global nav.
- Phase 05: integration — replace any temporary stubs with the real `<AwardSystem>` container.
