# Scoutd

**Find Your Next Player.**

Premium football recruitment web app — PWA-ready, mobile-first, built with Next.js 15+ and Supabase.

## Tech stack

- Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui
- Framer Motion · TanStack Query · React Hook Form · Zod
- Supabase (Auth, Database, Storage, Realtime)
- Serwist PWA

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Enable **Email** auth under Authentication → Providers.
3. Run migration:

```bash
npx supabase init
npx supabase link --project-ref <your-ref>
npx supabase db push
```

Or paste [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in the SQL editor.

5. Create storage buckets: `avatars`, `banners`, `highlights`, `club-assets` (public read policies as needed).

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Password reset / auth redirects:** In Supabase → **Authentication** → **URL configuration**:

| Environment | Site URL | Redirect URLs (add each) |
|-------------|----------|---------------------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://your-domain.vercel.app` | `https://your-domain.vercel.app/auth/callback` |

You can also add `https://your-domain.vercel.app/auth/callback**` to allow the `?next=` query param. Set the same production URL as `NEXT_PUBLIC_APP_URL` in Vercel (no trailing slash), then **redeploy** after changing env vars.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Admin user

Set a user's role in SQL:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

## Deploy to Vercel

1. Push to GitHub and import in Vercel.
2. Add all env vars from `.env.example`.
3. Set `NEXT_PUBLIC_APP_URL` to your production domain.
4. Deploy — verify PWA install on iOS Safari (Share → Add to Home Screen).

## Project structure

```
src/
  app/           # Routes (marketing, auth, app, admin)
  components/    # UI, layout, discovery, marketing
  features/      # Domain logic (auth, players, messaging, trials)
  lib/           # Supabase clients, design tokens
  types/         # TypeScript types
supabase/        # Migrations & seed
public/          # PWA manifest, icons, service worker
```

## Features

- Cinematic landing page
- Email/password auth, role selection, onboarding
- Player discovery (swipe, featured, trending, nearby)
- Advanced search & filters
- Player & coach profiles
- Messaging with realtime updates
- Trial invites
- Notifications
- Admin moderation panel
- Report / block

## License

Private — Scoutd © 2026
