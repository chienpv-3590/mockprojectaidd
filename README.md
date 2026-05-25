This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Auth setup (Supabase + Google OAuth)

This app uses Supabase Auth for Google sign-in.

1. **Create a Supabase project** at https://supabase.com/dashboard.
2. **Copy env vars:** `cp .env.local.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.
3. **Enable Google provider** in Supabase: Authentication → Providers → Google. You'll need a Google OAuth Client ID + Secret from Google Cloud Console (APIs & Services → Credentials → OAuth 2.0 Client IDs, type "Web application").
4. **Authorized redirect URI** in Google Cloud must include: `https://<project-ref>.supabase.co/auth/v1/callback`.
5. **Site URL** in Supabase (Authentication → URL Configuration): add `http://localhost:3000` for local dev and your production URL.

Without these, the dev server still boots but any auth code path throws on startup.

## Database setup (Supabase schema + seed)

The home page (`/`) reads awards, event date, notifications, and kudos from Supabase. Apply the schema + seed before running the app, or `/` will render empty sections.

```bash
# Open https://supabase.com/dashboard/project/<ref>/sql and run:
#   1. supabase/migrations/0001_init_homepage.sql
#   2. supabase/seed.sql
# After your first Google sign-in, also run (per user, once):
#   select public.seed_demo_data_for_current_user();
```

See `supabase/README.md` for full details (CLI and Studio paths).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
