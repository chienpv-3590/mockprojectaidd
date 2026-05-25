---
phase: 03
track: B
title: Data access layer — typed queries for the home page
status: completed
blockedBy: [02]
---

# Phase 03 — Track B: Data access layer

## Goal
Typed query helpers wrapping Supabase reads/writes for the home page's four data sources. Server-side functions consumed by the page (RSC), the notifications dropdown, and the countdown.

## Files to create
- `lib/data/types.ts` — TypeScript interfaces matching the schema (Award, Notification, EventSettings, KudosSummary)
- `lib/data/awards.ts` — `getAwards()` returns `Award[]` sorted by `display_order`
- `lib/data/event-settings.ts` — `getEventDate()` returns `Date | null`
- `lib/data/notifications.ts` — `getNotifications(userId, limit?)`, `getUnreadCount(userId)`, `markAllReadForUser(userId)`
- `lib/data/kudos.ts` — `getReceivedCount(userId)` returns `number`

## Patterns
- All read helpers take `supabase: SupabaseClient` as an injected first param so they work in both server components (with `cookies()`-bound client) and route handlers.
- Throw on Supabase error (do NOT silently return `[]`). Let the page's error boundary handle it. Cleaner failure mode.
- Return Date objects (not strings) where appropriate — parse in the helper, not the consumer.

## Example shape
```ts
// lib/data/awards.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Award } from "./types";

export async function getAwards(supabase: SupabaseClient): Promise<Award[]> {
  const { data, error } = await supabase
    .from("awards")
    .select("id, code, title_vi, description_vi, thumbnail_path, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
```

```ts
// lib/data/event-settings.ts
export async function getEventDate(supabase: SupabaseClient): Promise<Date | null> {
  const { data, error } = await supabase
    .from("event_settings")
    .select("value")
    .eq("key", "saa_event_date")
    .maybeSingle();
  if (error) throw error;
  if (!data?.value) return null;
  const d = new Date(data.value);
  return isNaN(d.getTime()) ? null : d;
}
```

```ts
// lib/data/notifications.ts
export async function markAllReadForUser(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}
```

## Success Criteria
- `getAwards()` returns 6 awards from seed data.
- `getEventDate()` returns a valid `Date` matching `'2026-12-31T19:00:00+07:00'`.
- `getNotifications(uid)` returns the user's seeded 5 notifications.
- `markAllReadForUser(uid)` flips `read=true` for all unread rows.
- Unit type check: `Award.thumbnail_path` is `string | null` (matches schema).

## Risks
- TS type for `SupabaseClient` is generic — accept the loose `any`-ish type or use the `Database` type from generated types (`supabase gen types typescript`). For YAGNI, plain `SupabaseClient` is fine.
- `maybeSingle()` returns `null` for "no rows" without erroring (right behavior).

## Out of Scope
- Query result caching.
- Pagination (notification list is capped at 10).
- Writing new notifications / new kudos.

## Outcome
Created 5 typed DAL files: `lib/data/types.ts` (Award, Notification, KudosSummary types), `awards.ts` (getAwards), `event-settings.ts` (getEventDate), `notifications.ts` (getNotifications, getUnreadCount, markAllReadForUser), `kudos.ts` (getReceivedCount). All take injected SupabaseClient; throw on error. Date fields parsed to Date objects server-side.
