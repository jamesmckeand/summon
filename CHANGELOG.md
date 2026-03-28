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

## Earlier (pre-session)

### Summon — Completed
- Full voting system (city × artist)
- Auth: Apple Sign In, Google, Facebook (now published), Email OTP
- Dashboard, explore, leaderboard, artist pages, profile, settings
- Superfan premium ($4/mo) — Stripe live
- Referral system (?ref= cookie, credits)
- Programmatic SEO — 1,000 `/live/[artistSlug]/[citySlug]` pages + sitemap
- Automated venue/promoter outreach on threshold crossing
- Artist booking contact lookup (50-away trigger)
- Email notifications: threshold crossing, 50-away warning, 7-day re-engagement cron, weekly trending digest
- Push notifications (APNS, daily 6pm UTC)
- Rate limiting (Upstash Redis)
- Full accessibility audit — 23 issues fixed
- Privacy policy, Terms of Service, EULA
- App Store listing copy, keywords, description — in `LAUNCH_COPY.md`
- Sentry error tracking
- Google Workspace (hello@wesummon.com)
- Stripe live (keys in Vercel + .env.local)
- Seed votes (35 combos, 10 artists)
