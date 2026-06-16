# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL Rules
- **NEVER use Co-Authored-By in commits** — breaks Vercel Hobby plan deployments (hook enforced)
- **Node binary**: `/opt/homebrew/bin/node`
- **All emails**: Use `hello@wesummon.com`, never personal email
- **Auth**: Always use `getUser()` not `getSession()` in server routes
- **HTML emails**: Always escape DB-sourced values with `escapeHtml()` before interpolating into email templates. `lib/outreach.ts` has a local `esc()` helper — use it for all fields sourced from `artist_contacts` or `promoters` tables.

## Commands

```bash
PATH="/opt/homebrew/bin:$PATH" npx next build   # build (use this exact form — bare node path causes Turbopack panic)
npm run dev                                       # dev server
git push origin main                              # Vercel auto-deploys on push (~2 min)
```

Always run build and confirm it passes before committing.

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase (auth + database), Vercel (hosting, repo: `jamesmckeand/summon`), Resend (email)
- Capacitor (iOS native wrapper, bundle ID: `com.wesummon.summon`)
- Sentry (error tracking), Stripe (payments), Upstash Redis (rate limiting)

## Architecture

### Auth flow
All server routes call `createClient()` from `lib/supabase/server.ts` (cookie-based, SSR-safe) then `supabase.auth.getUser()` before any data access. Admin routes use `createAdminClient()` from `lib/supabase/admin.ts` (service role key, bypasses RLS) — only use for operations that need to read across users. Admin identity is checked via `ADMIN_EMAILS` env var (comma-separated).

### Vote pipeline
Votes go through a Postgres RPC `cast_vote(p_user_id, p_artist_id, p_city)` defined in `supabase-cast-vote-rpc.sql`. The RPC atomically inserts and returns `{ inserted: boolean, vote_count: number }` in one transaction, eliminating the race condition of a separate COUNT + INSERT. The route (`app/api/votes/route.ts`) uses `before = vote_count - 1` / `after = vote_count` for threshold detection. If you ever re-create the Supabase project, run this SQL file first — votes will 500 without it.

### Threshold system
Thresholds are defined in `app/api/votes/route.ts` as `THRESHOLDS` array: 500 (bar) / 2,500 (theatre) / 7,500 (concert hall) / 25,000 (arena). The same values are duplicated in `app/api/cron/trending/route.ts` — keep them in sync if adding a tier. On threshold crossing the route fires: user email, internal outreach alert, automated promoter emails (`lib/outreach.ts`), artist contact queue, Make.com webhook, and push notification — all fire-and-forget with `.catch(() => {})`.

### Artist data
- **Static:** IDs `"1"`–`"1045"` in `lib/data/artists.ts`, bundled at build time
- **Community (Deezer search):** IDs `dz-{deezerId}`, written to `live_artists` table via `app/api/register-artist/route.ts`
- **Community (submit flow):** IDs `da_{uuid}`, written to `live_artists` after admin approval in `app/api/admin/route.ts`

### Email safety
All HTML email templates must escape user/DB-sourced values. `app/api/votes/route.ts` and `app/api/admin/route.ts` have a local `escapeHtml()`. `lib/outreach.ts` has `esc()`. Never interpolate raw DB fields from `artist_contacts`, `promoters`, `submissions`, or `live_artists` into HTML without escaping.

### Rate limiting
`lib/rate-limit.ts` wraps Upstash Redis with an in-memory fallback. Call pattern:
```ts
if (!await checkRateLimit(`votes:${ip}`, 30, 60)) return 429;
```
Applied to: votes (30/min), waitlist (3/hr), search, artist-image, lookup-artist-contact (20/min). The `lookup-artist-contact` endpoint uses `x-cron-secret` header (not `Authorization: Bearer`) — internal inconsistency, keep it that way.

### Admin outreach PATCH
`app/api/admin/outreach/route.ts` PATCH enforces a column allowlist per table. If you add editable fields, update `ALLOWED_COLUMNS` there — do not spread the raw request body.

## Conventions
- Font: Neue Montreal (`--font-neue-montreal`)
- Brand gradient: purple → indigo → blue (`gradient-brand`, `gradient-display`)
- Card surfaces: `#191919` — use `glass` on inner-app pages, `card-solid` on marketing pages
- Icons: Lucide React only
- Slug helpers: `lib/utils/artist-slug.ts` and `lib/utils/city-slug.ts` — use these for all URL generation, never inline `.toLowerCase().replace(...)`

## Key Database Tables
- `votes` — one row per (user_id, artist_id, city); unique constraint prevents double-voting
- `vote_counts` — view/materialized table consumed by trending cron; do not write to it directly
- `subscriptions` — Superfan $4/mo via Stripe; gated by `status = 'active'`
- `referrals` — `?ref=` cookie attribution, credited once per referred user on first login
- `artist_contacts` — booking contact lookup (fires on 50-away threshold); populated by `lookup-artist-contact` scraping Wikipedia + DuckDuckGo
- `outreach_log` — dedups promoter emails by `(artist_id, city, threshold, promoter_id)`
- `promoters` — venue/promoter contacts per city; `booking_email` required for outreach
- `push_tokens` — iOS APNs tokens; `lib/apns.ts` handles JWT signing and HTTP/2 delivery

## Cron / Email
- All email via Resend (`hello@wesummon.com`); use `resend.batch.send()` for bulk, never sequential loops
- Re-engagement: daily 10am UTC (`/api/cron/reengagement`) — users inactive 7–30 days
- Trending digest: Mondays 9am UTC (`/api/cron/trending`) — combos within 20% of next threshold
- Push notifications: daily 6pm UTC (`/api/cron/push`) — same inactive-user logic as reengagement
- All crons authenticated via `Authorization: Bearer ${CRON_SECRET}` header

## iOS
- Bundle ID: `com.wesummon.summon`, Apple Developer active
- Capacitor wraps the Next.js web app; Google/Facebook OAuth blocked in WKWebView — use email OTP or Apple Sign In on native
- Still needed before App Store submission: app icon 1024×1024, screenshots, demo account, App Store Connect IAP setup
