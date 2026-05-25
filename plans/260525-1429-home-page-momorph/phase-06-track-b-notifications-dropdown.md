---
phase: 06
track: B
title: Notifications dropdown (bell + panel)
status: completed
blockedBy: [03]
---

# Phase 06 — Track B: Notifications dropdown

## Goal
Replace the visual-stub bell icon with a working bell + dropdown panel showing the current user's notifications. Badge displays unread count. Opening the panel marks them all read.

## Files to create
- `app/_components/home/notification-bell.tsx` — `"use client"` component (bell button + badge + dropdown)
- `app/_actions/mark-notifications-read.ts` — `"use server"` action wrapping `markAllReadForUser`

## Server action contract
```ts
// app/_actions/mark-notifications-read.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { markAllReadForUser } from "@/lib/data/notifications";
import { revalidatePath } from "next/cache";

export async function markNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await markAllReadForUser(supabase, user.id);
  revalidatePath("/");
}
```

## Client component props
```ts
type Notification = { id: string; title: string; body: string | null; read: boolean; created_at: string };

type NotificationBellProps = {
  initialNotifications: Notification[];   // first 10, server-fetched
  initialUnreadCount: number;             // server-fetched
};
```

## Behavior
- Bell icon with red badge showing `initialUnreadCount`. Hide badge if 0.
- Click bell → toggle dropdown panel (anchored under the bell, right-aligned)
- Panel shows up to 10 notifications: title, body, relative time ("5 phút trước")
- On panel **open** → call `markNotificationsRead()` server action via `useTransition`. Optimistically set local `unreadCount = 0` immediately.
- Empty state: "Chưa có thông báo nào"
- Click outside / Esc → close panel

## Optimistic UI rule
- Mark-as-read fires the moment the panel opens (not on item click).
- If the server action fails, log to console; do NOT roll back the optimistic UI (the user has already seen them).

## Success Criteria
- Badge shows correct unread count from seed data (5 after first login + seed function).
- Opening the panel sets badge to 0 immediately.
- Refreshing the page confirms `read=true` in DB.
- Empty state renders when user has 0 notifications.
- RLS: notifications belong only to current user (verified by attempting to fetch with another user's ID — should return 0 rows).

## Risks
- `revalidatePath('/')` may not be enough if the bell's badge is rendered from a server fetch — could need to also `router.refresh()` from client. Test both.
- Race: user opens panel twice rapidly → `markNotificationsRead()` called twice → second call is a no-op (already read).
- Click-outside detection same pattern as user-menu in Phase 05 — extract to a shared `useClickOutside` hook if both need it.

## Out of Scope
- Mark single notification as read (only bulk mark).
- Delete notifications.
- Realtime push (Supabase Realtime).
- Notification preferences.

## Outcome
Built `app/_components/home/notification-bell.tsx` ("use client") bell + dropdown panel + `app/_actions/mark-notifications-read.ts` server action. Bell shows red badge with unread count. Panel opens/closes on click, lists up to 10 notifications. Opening panel calls markNotificationsRead via useTransition (optimistic UI). Empty state: "Chưa có thông báo nào". Click-outside detection same pattern as user-menu.
