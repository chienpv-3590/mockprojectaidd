# Clarifications

## Session 2026-05-25 (planning)
- Q: Which authentication backend? → A: Supabase (BaaS, via `@supabase/ssr`)
- Q: Which credential methods? → A: Google OAuth only (wired). Email/password fields rendered per design but not wired.
- Q: Post-login redirect target? → A: `/` (existing root)
- Q: Signup / forgot-password link behavior? → A: Placeholder only — route to `#` in this plan
- Q: Should `/` redirect unauthenticated users to `/login`? → A: Yes, via Next.js middleware using `@supabase/ssr` session check
- Q: Should the email/password form fields be visible? → A: Render per design, mark disabled/visual-only — out of scope for wiring

## Session 2026-05-25 (during forge)
- Q: Do form fields exist in MoMorph design? → A: No — only Google button. Assumption of disabled-fields placeholder discarded.
- Q: Do signup / forgot-password links exist in design? → A: No — not rendered. Original `href="#"` stubs dropped.
- Q: Background artwork fetchable from MoMorph? → A: No — nodes 662:14388 and 662:14389 returned HTTP 500. Workaround: used design preview render (preview.png) resized to background.jpg via imagemagick.
- Q: Language switcher fully wired? → A: No — visual stub only (VN flag + chevron dropdown, non-functional). Wiring deferred to future i18n plan.
- Q: Next.js 16 middleware convention? → A: middleware.ts → proxy.ts, function middleware() → proxy() per deprecation notice in AGENTS.md.
