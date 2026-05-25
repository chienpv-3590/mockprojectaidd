# Clarifications

## Session 2026-05-25 (planning)
- Q: Header nav targets (About SAA 2025, Awards Information, Sun* Kudos, etc.) — implement or stub? → A: Stub all. Only `/` is real. Links route to `#`. Other pages deferred.
- Q: Countdown behavior? → A: Real client-side countdown to event date stored in `NEXT_PUBLIC_SAA_EVENT_DATE` env var (ISO string). Tick every second. Show "Coming soon" if event date is in the past.
- Q: User profile button (top-right) behavior? → A: Dropdown with user name/email from Supabase session + working Sign out. No Profile/Settings links (out of scope).
- Q: Award card "Chi tiết" buttons wired? → A: No — stub `href="#"` only.
- Q: Sun* Kudos CTA wired? → A: No — stub `href="#"`.
- Q: Floating action button (item 6) wired? → A: No — render pill, no click handler.
- Q: Notification bell wired? → A: No — render icon, no panel, no badge logic.
- Q: Language switcher functional? → A: No — same as login: visual stub.

## Session 2026-05-25 (backend addition)
- Q: Which home page sections need real backend? → A: All four — awards, notifications, event settings, kudos summary.
- Q: Data layer pattern? → A: Supabase tables (`supabase/migrations/*.sql` + `supabase/seed.sql`), RLS policies, server-side queries via typed DAL in `lib/data/*.ts`.
- Q: Award thumbnails source? → A: Download all 6 from MoMorph via the bash-curl bypass (same pattern as login).
- Q: Event date storage — env var vs DB? → A: DB (`event_settings` table). Reverses earlier decision — gives ops the ability to change date without rebuild.
- Q: Notifications scope — push or pull? → A: Pull only (initial fetch + mark-as-read on panel open). No Supabase Realtime in v1.
- Q: Mock data seeding model? → A: `seed.sql` for global rows (awards, event date). `seed_demo_data_for_current_user()` SECURITY DEFINER function for per-user rows (notifications, kudos) — operator runs it once per user after their first login.

## Session 2026-05-25 (during forge)
- Q: MoMorph media URL expiry? → A: Signed URLs have 10-min TTL; some transient 504s during batch download. Refetch `media_files.json` for fresh URLs on timeout. Signature 2025 Creator had one timeout; manual retry succeeded.
- Q: Lint during forge? → A: Found react-hooks/set-state-in-effect (redundant setRemaining in countdown effect) + unused Image import in user-menu. Fixed inline pre-commit.
- Q: Phase 01 mock data vs Phase 07 integration? → A: Phase 01 had inline MOCK_AWARDS constant for standalone preview. Phase 07 integration replaced with `getAwards(supabase)` — DB now feeds the grid.
- Q: DB migration path for operator? → A: Defer seed data insertion (per-user function) until after first login. Global seed (awards, event date) applied once via migration. README.md + supabase/README.md document the flow.
