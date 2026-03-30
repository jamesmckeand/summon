# Summon — Claude Instructions

## CRITICAL Rules
- **NEVER use Co-Authored-By in commits** — breaks Vercel Hobby plan deployments (hook enforced)
- **Node binary**: `/opt/homebrew/bin/node`
- **All emails**: Use `hello@wesummon.com`, never personal email
- **Auth**: Always use `getUser()` not `getSession()` in server routes

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase (auth + database), Vercel (hosting, repo: `jamesmckeand/summon`), Resend (email)
- Capacitor (iOS native wrapper, bundle ID: `com.wesummon.summon`)
- Sentry (error tracking), Stripe (payments), Upstash Redis (rate limiting)

## Security
When you find a security vulnerability, flag it immediately with a WARNING and suggest a fix. Never implement insecure patterns even if asked.

## Conventions
- Font: Neue Montreal (`--font-neue-montreal`)
- Brand gradient: purple → indigo → blue (`gradient-brand`, `gradient-display`)
- Card surfaces: `#191919` — use `glass` on inner-app pages, `card-solid` on marketing pages
- All API routes must call `supabase.auth.getUser()` before returning data
- Icons: Lucide React only

## Data
- Static artists: IDs `"1"`–`"1045"` in `lib/data/artists.ts`
- Community artists: `da_{uuid}` (submit flow) or `dz-{deezerId}` (Deezer search)
- Vote thresholds: 500 (bar) / 2,500 (theatre) / 7,500 (concert hall) / 25,000 (arena)

## Key Database Tables
- `votes` — artist/city vote counts
- `subscriptions` — Superfan $4/mo via Stripe
- `referrals` — `?ref=` cookie attribution
- `artist_contacts` — booking contact lookup (fires on 50-away threshold)
- `outreach_log` — venue promoter emails sent
- `promoters` — venue/promoter contacts per city
- `push_tokens` — iOS APNS tokens

## Email / Cron
- All email via Resend (`hello@wesummon.com`)
- Threshold alerts: 500 / 2,500 / 7,500 / 25,000 votes
- Re-engagement cron: daily 10am UTC (`/api/cron/reengagement`)
- Trending digest: Mondays 9am UTC (`/api/cron/trending`)
- Push notifications: daily 6pm UTC (`/api/cron/push`)
- Batch sending: use `resend.batch.send()` — never sequential loops

## Rate Limiting
- Redis-backed via Upstash (`lib/rate-limit.ts`)
- Falls back to in-memory if env vars missing
- Applied to: votes, search, artist-image, waitlist

## Git Workflow
```bash
npm run build      # Must pass before committing
git log --oneline -5  # Verify no Co-Authored-By (hook also enforces this)
git commit -m "type: description"
git push origin main   # Vercel auto-deploys on push
```

## iOS Status (Pre-Launch Pending)
- Bundle ID: `com.wesummon.summon`
- Apple Developer: active ($99/yr)
- Still needed: app icon 1024×1024, screenshots, demo account, App Store Connect setup
