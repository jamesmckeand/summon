# Summon — Changelog

---

## 2026-03-28

### Launched
- **Removed coming-soon gate** — set `COMING_SOON=false` in Vercel + `.env.local`. Site live at wesummon.com.
- **Submitted sitemap to Google Search Console** — 2,398 pages discovered and processed successfully.
- **Enabled Vercel Web Analytics** — pageview + visitor tracking live, no code changes required.

### Auth
- **Published Facebook Login** — Meta Business Verified, app published (App ID: 922422720514036). Facebook OAuth now available to all users (previously dev-mode only, 25-user cap).

### Frontend
- **Hero background — bouncing orbs** — replaced static CSS glow with `HeroOrbs` client component: 9 orbs (purple, indigo, blue, pink, lavender, sky) bouncing off all 4 walls with JS physics. Scales down on mobile, responds to resize/orientation change.
- **Favicon** — added `app/icon.tsx` using Next.js ImageResponse. Purple gradient "S" on dark background. Auto-served at all sizes.
- **Dashboard Suspense boundary** — wrapped `useSearchParams()` in `<Suspense>` to fix Next.js 16 prerender error crashing Vercel builds.

### Data
- **44 new artists added** — database expanded from 1,001 → 1,045. Additions include: My Chemical Romance, Florence + the Machine, Laufey, Fuerza Regida, JENNIE, ROSÉ, Leon Thomas, Olivia Dean, Ethel Cain, Arijit Singh, AP Dhillon, Mk.gee, Turnstile, Mannequin Pussy, Cash Cobain, Ken Carson, and more. All verified alive and actively touring.

### Infrastructure
- **Upstash Redis live** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` added to Vercel. Rate limiting now backed by Redis (crisp-starfish-86524.upstash.io) instead of in-memory fallback.
- **Fixed Vercel deployment blocking** — Co-Authored-By commit trailer caused Hobby plan to block deploys. Resolved via force push + GitHub repo reconnect in Vercel settings.
- **Fixed missing files causing build failures** — `UserAvatar.tsx`, `list-all-users.ts`, `app/admin/outreach/`, `app/help/`, `app/settings/`, `lib/data/city-images.ts`, `public/.well-known/apple-app-site-association` were untracked. Committed and pushed.

### Content
- **Launch copy written** — saved to `LAUNCH_COPY_NEW.md`: waitlist email, Betalist listing, Peerlist listing, r/SideProject post, Indie Hackers post, r/concerts post, r/indieheads post, r/hiphopheads post.

---

## 2026-03-27

### Security
- **Supabase Security Advisor fixes** — ran `supabase-security-advisor-fixes.sql`:
  - Fixed `update_updated_at` trigger function (mutable search path → `security invoker set search_path = ''`)
  - Fixed `push_tokens` RLS policy (was always-true → scoped to `auth.uid() = user_id`)
- **Password requirements hardened** — minimum 8 chars, uppercase + lowercase + number required (set in Supabase Auth dashboard).
- **Supabase auto-pause reset** — visited dashboard to reset 7-day activity clock.

### Infrastructure
- **Upstash Redis DB created** — free tier at upstash.com (crisp-starfish-86524.upstash.io). Token regenerated before adding to Vercel.
- **Ride Her Cup pushed to GitHub** — private repo `jamesmckeand/ridehercup` created and pushed.

### Design — Ride Her Cup
- **Premium golf aesthetic applied** — forest green `#0D2B1E` background, warm cream text, gold `#C9A84C` accent, Playfair Display serif headings, Neue Montreal body. Applied to `globals.css`, `layout.tsx`, and `Nav.tsx`.

### Agents
- **16 agents created** in `/Users/JM/Documents/Agents/`:
  - `kama-booking.md` — artist/venue booking contact research
  - `kama-content.md` — event content calendar generator
  - `kama-debrief.md` — post-event debrief + P&L
  - `venue-scout.md` — venue research for new markets
  - `dj-relations.md` — DJ/management email relations
  - `summon-outreach.md` — venue/promoter outreach drafts
  - `summon-reddit.md` — Reddit community engagement
  - `summon-changelog.md` — automated changelog generator
  - `summon-app-store-reviews.md` — App Store review monitor + response drafts
  - `competitor-monitor.md` — weekly competitive intelligence
  - `golf-flipper.md` — Marketplace scraper for undervalued golf equipment
  - `golf-flipper-lister.md` — auto-draft resell listings (FB Marketplace, Kijiji, eBay CA)
  - `job-search.md` — job application tracker
  - `meeting-brief.md` — pre-meeting research briefs
  - `weekly-recap.md` — Sunday cross-project weekly review
  - `invoice-contract.md` — freelance invoice + contract generator

---

## 2026-03-26

### KAMA Events — Hamilton Apr 17
- **Content schedule built** — full 7-phase content plan for KAMA x Hamilton (venue: Resonance/DIALD., lineup: Aydan XR, Procta, Sasha Kalra). Covers both partnership and DIY scenarios.
- **Captions written** — IG announcement, story, alt caption, TikTok, early bird sold-out, final week.
- **Paid ads strategy** — IG + TikTok, Hamilton geo-targeted, Apr 10–16, $100–150/platform.
- **Partnership recommended** — venue soft open Mar 27 aligned with launch, joint drop strategy documented.
- Saved to `/Users/JM/Documents/KAMA Events/Apr17 - KAMA x Hamilton 2026.md`

### Survivor Pool
- **Eliminations updated** — corrected through Ep 5: Jenna (ep1), Kyle medevac (ep2), Savannah (ep2), Q (ep3), Mike (ep4), Angelina (ep5), Charlie (ep5).
- **Wrong contestants fixed** — Tony Vlachos and Yam Yam Arocho replaced with Chrissy Hofbeck (S35) and Tiffany Ervin (S46).
- **Confirmation modal added** — prompt before drafting to confirm correct player.
- **Eliminated castaways hidden from draft list** — can no longer be selected.
- **Dynamic snake draft** — auto-calculates picks based on remaining castaway count (17 available → 5 players get 3 picks, 1 gets 2).
- **Player badges** — Mack ♿, Zack 🍑 displayed everywhere their names appear.
- **Player order updated** — James, Piotr, Niki, Zack, Mack, Ania.

---

## 2026-03-21

### Accessibility (23 issues fixed)
- All dropdowns converted from `div` → `button` with `aria-haspopup`, `aria-expanded`, `role=listbox/option` — CityDropdown, ExploreFilters, leaderboard
- `AuthModal` — added `role=dialog`, `aria-modal`, `aria-labelledby`
- Toggle — added `role=switch`, `aria-checked`
- All icon-only buttons — added `aria-label` (edit, save, cancel, share, close, remove)
- All search/form inputs — added `sr-only` labels
- Venue selection buttons — added `aria-pressed`
- BottomNav — added `aria-current=page`, icons `aria-hidden`
- All `text-[10px]` → `text-xs` across all files (dynamic text size support)

### UX Polish
- Popular cities added to CityDropdown
- Consistent ambient glow across all inner-app pages
- Vote progress bar added to artist pages
- Vote button animation on cast
- Leaderboard rank numbers styled with brand gradient
- Error boundary added to catch runtime errors gracefully

### Security
- Input validation hardened across all API routes
- XSS escaping verified on all user-submitted content
- Referral system security — UUID format enforced on `?ref=` param
- Rate limiting expanded: votes, search, artist-image, waitlist endpoints
- Stripe webhook signature verification added
- Email preferences API secured with session check

### Auth
- Removed Spotify login — dev mode 25-user cap (re-add at 250k MAU)
- Removed Spotify from all UI: login modal, homepage, explore, onboarding

### Meta / Verification
- Facebook domain verification meta tag added
- Impact.com site verification meta tag added + updated

---

## 2026-03-11

### Growth
- **Artist booking contact lookup** — `artist_contacts` table, fires async on 50-away or threshold crossing. Looks up booking email via web search and stores for outreach.
- **Automated venue/promoter outreach** — `outreach_log` table + `lib/outreach.ts`. Emails sent to venues when vote thresholds crossed (500/2500/7500/25000).

### Revenue
- **Stripe Superfan** — $4/mo subscription live. `subscriptions` table, `/superfan` paywall page, Stripe webhook handling, EULA linked.
- **APNS push notifications** — `lib/apns.ts`, `push_tokens` table, `/api/cron/push` (daily 6pm UTC). Notifies users when artists near threshold.

### SEO
- Programmatic SEO pages — `/live/[artistSlug]/[citySlug]` — 1,000 static pages generated, sitemap wired.

---

## 2026-03-09

### Growth
- **Referral system** — `?ref=` cookie (first touch wins), auth callback credits referrer, `shareUrls` wired throughout app.
- **Email triggers** — threshold crossing email + internal alert (500/2500/7500/25000), "50 votes away" warning email.
- **7-day re-engagement cron** — `/api/cron/reengagement`, runs daily 10am UTC via Vercel cron.
- **Weekly trending digest** — `/api/cron/trending`, runs Mondays 9am UTC.
- **Sentry** — error tracking integrated. `SENTRY_DSN` in Vercel.
- **Affiliate stubs** — Impact.com account created as "Summon Music". Ticketmaster affiliate URL wired.

---

## 2026-03-08

### Security (full audit)
- Sessions and auth via Supabase — all routes protected
- Parameterized queries throughout — no raw SQL
- RLS policies on all tables
- Redirect URL validation in auth callback
- Rate limiting on votes, search, artist-image, waitlist
- `npm audit` — 0 vulnerabilities
- `middleware.ts` → `proxy.ts` (Next.js 16 compatibility fix)

### Design
- Dashboard card aesthetic — Dark Slate Gray `#191919` surfaces
- Mobile bottom tab bar (BottomNav) — Home, Explore, Leaderboard, Profile
- `CLAUDE.md` added to repo — conventions, stack, security rules for AI sessions

---

## 2026-03-07

### Features
- **Apple Music import** — `AppleMusicConnect` component in profile. Imports top artists into `favourite_artists` on connect. Library limit bumped to 100.
- **Spotify top artists import** — fires on first login, imports into `favourite_artists`.
- **Social logins** — Apple Sign In, Google OAuth, Facebook OAuth (dev mode), Email OTP all wired via Supabase.
- **Animated crowd silhouette hero** — spotlight effect, CSS animation. (Later removed — redesigned.)
- **Marquee** — scrolling artist name ticker on homepage.

### Refactors
- Extracted shared `ArtistAvatar` component
- Extracted shared `AuthModal` component
- Extracted shared `CityDropdown` component
- Modularised explore page, artist client, submit flow, profile

### Affiliate
- Switched Ticketmaster affiliate from CJ → Impact
- Impact site verification meta tag added

### Full site redesign
- Brand gradient (purple → indigo → blue) across all surfaces
- Neue Montreal via `next/font/local` (replaced system font)
- Programmatic SEO structure established
- OG images for artist pages
- Profile vote history page

---

## 2026-03-05 – 2026-03-06

### Artist Images
- Pre-baked artist images into `/public/artist-images.json` — eliminates runtime Deezer timeout. 890/1001 artists covered.
- Artist page rewrite — image, top tracks audio previews, vote history.

### Homepage
- Auth-aware CTAs (logged in vs logged out state)
- Simplified threshold labels
- "Millions of" artist count copy

---

## 2026-03-04

### Features
- **Live Deezer artist search** — users can search any artist not in static catalogue and vote instantly. Results fed via Deezer API, stored as community artists (`dz-{deezerId}` prefix).
- **Ticket mascot** — animated ticket man character (later reverted for redesign).
- City expansion — additional cities added to catalogue.
- Renamed duplicate `Birmingham` key → `Birmingham, UK`.

---

## 2026-03-03

### Security
- Waitlist deduplication — prevent duplicate email signups
- Rate limiting on waitlist endpoint
- RLS gap patched
- Cache hardening on API routes

---

## 2026-03-02

### Shows Page
- **Shows page built** — aggregates real concert data from Bandsintown + Songkick. Artist-grouped cards, city filter, urgency badges, client-side load more.
- City filter → search bar (replaced pill scroller)
- Sort shows by user's favourites first, then popularity
- Artist-show matching fixed (was matching wrong artists)
- Shows hidden until search query entered

### Cities
- **Cities leaderboard** — `/cities` page showing vote totals by city.
- Referral URLs wired to city and artist pages.

### Bug Fixes
- White flash on page load fixed (removed body `background-image`, fixed Framer Motion + light gradient conflict)
- Expired shows filtered out
- TypeScript sort error in shows route fixed
- Marquee hidden by hero `overflow-hidden` fixed

### Infrastructure
- Coming soon page merged into `proxy.ts` — single middleware handles both the gate and auth cookie refresh.

---

## 2026-03-01

### Foundation
- **Initial commit** — Summon app created with `create-next-app`.
- Stack: Next.js 16, TypeScript, Tailwind CSS, Supabase, Resend, Vercel.
- **Spotify personalization** — For You section on explore, top artists import.
- Page transitions, loading skeletons across all pages.
- Legal pages: Privacy Policy (`/privacy`), Terms of Service (`/terms`).
- Footer with links.
- Vercel Analytics wired.
- Email sender set to `hello@wesummon.com` via Resend.

---

## 2026-02-28

- **Project initialised** — `create-next-app` scaffold. Repository: `jamesmckeand/summon`.
