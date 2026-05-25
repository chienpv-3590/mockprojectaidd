---
phase: 05
track: A+B
title: Integrate UI ↔ auth, wire Google button + error display
status: completed
blockedBy: [01, 03, 04]
---

# Phase 05 — Integration

## Goal
Connect Track A's UI to Track B's server action, render OAuth error messages, and ensure the form fields are visually present but inert.

## Files to modify
- `app/login/page.tsx` (from Phase 01) — wire the Google button to `signInWithGoogle` server action; render `?error=` query param as inline error message above the form
- Email/password inputs → add `disabled` attribute and remove `name` attributes so the form submission does nothing if the user hits Enter

## Implementation Steps
1. In `app/login/page.tsx`:
   - Convert the page to a Server Component that reads `searchParams?.error` (Next.js 16 — verify `searchParams` is async).
   - Pass `signInWithGoogle` server action to the Google button via `<form action={signInWithGoogle}>` wrapping the button (preferred Next.js pattern over `onClick`).
2. Render error banner above the form if `error === 'auth_callback_failed'` → "Sign-in failed. Please try again." (use a Tailwind alert style consistent with the design).
3. Email/password fields: `disabled`, `aria-disabled="true"`, no `name` attrs.
4. Signup / forgot-password / any social-other links → `href="#"`, `aria-disabled="true"`, `tabIndex={-1}`, optional `title="Coming soon"`.

## Success Criteria
- Clicking "Continue with Google" navigates to Google OAuth consent.
- Successful sign-in lands on `/`; session cookie set; refreshing `/` does NOT bounce to `/login`.
- Failed sign-in lands on `/login?error=auth_callback_failed` with visible error banner.
- Email/password inputs cannot be focused or submitted.

## Risks
- Wrapping the Google button in a `<form>` only works for plain server actions, not for actions that need a JSON return. Since `signInWithGoogle` does `redirect(...)`, the form-action pattern works.
- If MoMorph design renders the Google button as `<a>`, swap to `<button type="submit">` inside the form wrapper — visual styling preserved.

## Out of Scope
- Loading spinner during OAuth round-trip (optional polish — defer unless trivial).

## Outcome
**Delivered:** `app/login/page.tsx` converted to async RSC reading `searchParams.error`. Google button wired to `signInWithGoogle` server action via `<form action={...}>` pattern. Error banner renders `?error=auth_callback_failed` with styled alert. Design has no email/password fields (updated assumption from original spec); no disabled-field stubs rendered. All signup/forgot-password links not rendered (design has none). Integration tested end-to-end: successful OAuth redirects to `/`, failed OAuth shows error banner. No layout shifts from Phase 01.
