---
phase: 05
track: B
title: User menu dropdown with Sign-out
status: completed
---

# Phase 05 — Track B: User menu + Sign-out

## Goal
Dropdown anchored to the header's user icon (top-right). Shows current user's display name + email (from Supabase session). Has a "Sign out" item that calls a server action which signs out via Supabase and redirects to `/login`.

## Files to create
- `app/_components/home/user-menu.tsx` — `"use client"` component (click-to-open dropdown, click-outside-to-close)
- `app/_actions/sign-out.ts` — `"use server"` action

## Server action contract
```ts
// app/_actions/sign-out.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

## Client component shape
```ts
// Receives user info as prop from the parent Server Component (so the page can fetch it once).
type UserMenuProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
};
```

## How the page (Phase 07 integration) supplies the prop
Page reads session via `createClient` from `lib/supabase/server.ts`, calls `supabase.auth.getUser()`, extracts `user.user_metadata.full_name` / `user.email` / `user.user_metadata.avatar_url`, and passes them down to `<UserMenu user={...} />`.

## Behavior
- Click user icon → open dropdown beneath/right-aligned
- Dropdown shows: user avatar (or initial), name, email
- Single menu item: "Sign out" (Vietnamese: "Đăng xuất")
- Click "Sign out" → `<form action={signOut}><button type="submit">Đăng xuất</button></form>` → server action runs → redirect
- Esc or click outside → close dropdown

## Risks
- If user `user_metadata` is empty (rare for Google OAuth but possible), fall back to email-only display.
- Avatar URL is hosted on `googleusercontent.com` — needs `images.remotePatterns` in `next.config.ts` to render via `next/image`, OR use plain `<img>` for the avatar (simpler).
- Click-outside detection: use `useEffect` + `addEventListener('click', ...)` with proper cleanup.

## Success Criteria
- After Google sign-in, clicking the user icon opens the dropdown with the correct name/email.
- Clicking Sign out clears the session and lands the user on `/login`.
- Direct visit to `/` after sign-out bounces to `/login` (proxy middleware unchanged).

## Out of Scope
- Profile page link.
- Settings link.
- Avatar customization.
- Multi-account switcher.

## Outcome
Built `app/_components/home/user-menu.tsx` ("use client") dropdown component + `app/_actions/sign-out.ts` server action. Menu displays name/email/avatar; Sign out clears session and redirects to /login. Avatar via plain <img> (not next/image) to avoid remotePatterns config. Click-outside detection via useEffect event listener with cleanup.
