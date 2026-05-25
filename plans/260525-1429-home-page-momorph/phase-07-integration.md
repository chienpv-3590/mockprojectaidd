---
phase: 07
track: A+B
title: Integration — page server-fetches data, slots all components
status: completed
blockedBy: [01, 04, 05, 06]
---

# Phase 07 — Integration

## Goal
Convert `app/page.tsx` into an async Server Component that fetches user + all four data sources in parallel, then renders the home page (Phase 01) with the real components from Phases 04 / 05 / 06 slotted in. Pass server-fetched data down as props.

## Files to modify
- `app/page.tsx` (from Phase 01) — wire everything

## Integration steps
1. **Imports:**
   ```ts
   import { createClient } from "@/lib/supabase/server";
   import { redirect } from "next/navigation";
   import { getAwards } from "@/lib/data/awards";
   import { getEventDate } from "@/lib/data/event-settings";
   import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
   import { getReceivedCount } from "@/lib/data/kudos";
   import { UserMenu } from "@/app/_components/home/user-menu";
   import { CountdownTimer } from "@/app/_components/home/countdown-timer";
   import { NotificationBell } from "@/app/_components/home/notification-bell";
   ```

2. **Top of `HomePage` (async server component):**
   ```ts
   export default async function HomePage() {
     const supabase = await createClient();
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) redirect("/login");

     // Parallel fetches — fail-fast on error
     const [awards, eventDate, notifications, unreadCount, kudosReceived] = await Promise.all([
       getAwards(supabase),
       getEventDate(supabase),
       getNotifications(supabase, user.id, 10),
       getUnreadCount(supabase, user.id),
       getReceivedCount(supabase, user.id),
     ]);

     const userProps = {
       name: user.user_metadata?.full_name ?? user.email ?? "Người dùng",
       email: user.email ?? "",
       avatarUrl: user.user_metadata?.avatar_url ?? null,
     };

     // ...render JSX with all components slotted in
   }
   ```

3. **Header slot:** `<UserMenu user={userProps} />` replaces the user icon stub. `<NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />` replaces the bell stub.

4. **Hero slot:** `<CountdownTimer eventDateIso={eventDate?.toISOString() ?? null} />` replaces the countdown placeholder.

5. **Awards grid:** Pass `awards` array to `<AwardsGrid awards={awards} />`. The grid component (from Phase 01) maps over the array → `<AwardCard award={...} />` instead of rendering 6 hardcoded copies.

6. **Kudos section:** Pass `kudosReceived` count to `<KudosSection receivedCount={kudosReceived} />` so it can show "You've received X kudos this season" (or similar copy).

## Success Criteria
- `/` renders for authenticated user with all dynamic data visible:
  - User name/email/avatar in dropdown
  - Real countdown from DB event date
  - 6 awards rendered from DB (NOT hardcoded)
  - Notification badge shows unread count
  - Kudos section shows received count
- Sign out works end-to-end.
- All other interactives stay as `href="#"` stubs.

## Risks
- `Promise.all` rejects if ANY of the 5 queries throws. Either wrap each in try/catch with sensible fallback OR let the error boundary handle. Decision: let it throw — surfaces real bugs.
- If awards table is empty (migration not applied), `getAwards()` returns `[]`. Page should render a clear empty state ("Chưa có hạng mục giải thưởng") rather than a broken grid.
- Avatar via `<img>` (not `<Image>`) per Phase 05 — keeps `next.config.ts` untouched.

## Out of Scope
- Wiring nav links, FAB, language switcher, award detail buttons, Kudos CTA — remain `href="#"` stubs.
- Suspense boundaries / streaming — page can wait for all fetches.
- Error boundary customization — Next.js default error.tsx is fine.

## Outcome
Converted `app/page.tsx` to async RSC. Page fetches user session + 5 data sources in Promise.all (getAwards, getEventDate, getNotifications, getUnreadCount, getReceivedCount). Slots <UserMenu>, <NotificationBell>, <CountdownTimer> with real server-fetched props. <AwardsGrid> maps DB awards array instead of hardcoded 6 copies. <KudosSection> receives received_count. Navigation/FAB/language remain stub `href="#"`.
