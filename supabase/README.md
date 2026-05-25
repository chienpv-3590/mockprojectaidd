# Supabase

Schema + seed for SAA 2025.

## Layout

```
supabase/
├── migrations/
│   └── 0001_init_homepage.sql   # awards, event_settings, notifications, kudos + RLS
├── seed.sql                      # 6 awards, event date, per-user seed function
└── README.md                     # this file
```

## Apply (pick one)

### Option A — Supabase CLI (recommended)

```bash
# Link the project once (use the ref from your Supabase project URL).
supabase link --project-ref <YOUR_PROJECT_REF>

# Push schema migrations.
supabase db push

# Apply seed (CLI doesn't auto-seed for remote projects; paste the file in Studio,
# or use the SQL editor as described in Option B).
```

### Option B — Supabase Studio (SQL editor)

1. Open `https://supabase.com/dashboard/project/<YOUR_PROJECT_REF>/sql`
2. Paste the contents of `migrations/0001_init_homepage.sql` → Run
3. Paste the contents of `seed.sql` → Run

## After signing in for the first time

The seed only populates global rows (awards, event date). To get per-user demo
notifications + kudos for the account you just signed in with, run **once** in the
SQL editor:

```sql
select public.seed_demo_data_for_current_user();
```

That function is `SECURITY DEFINER` but only ever writes rows for the caller's
own `auth.uid()`. Safe to call once per user; subsequent calls are no-ops (it
checks for existing rows first).

## Verify

```sql
select count(*) from public.awards;                  -- 6
select * from public.event_settings;                 -- 1 row
select count(*) from public.notifications;           -- 5 after seed-for-user
select count(*) from public.kudos where to_user = auth.uid();  -- 3 after seed-for-user
```
