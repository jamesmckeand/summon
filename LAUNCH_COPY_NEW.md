# Summon — Launch Copy (New)

---

## 1. Waitlist "You're In Early" Email

**Subject:** You're in early — here's what Summon does

**From:** James at Summon <hello@wesummon.com>

---

Hey,

You signed up for Summon a while back — and we're live. I wanted to reach out personally before we do the big push.

Here's what Summon does: you vote for artists you want to see perform in your city. When enough fans vote, we take that demand data directly to venues and promoters so the show actually gets booked. No more wondering if your favourite artist will ever come to your city. No more hoping they notice you exist.

The thresholds are real — 500 votes unlocks bar/club, 2,500 gets a theatre, 7,500 a concert hall, 25,000 an arena. When a threshold hits, we reach out. You get notified first.

You're one of the first people on the platform. The votes you cast right now are the ones that matter most.

Go vote at wesummon.com — it takes about 60 seconds.

— James

---

## 2. Betalist Listing

**Title (max 60 chars):**
Summon — Vote artists to your city

**Tagline (max 100 chars):**
Fan demand that actually moves shows. Vote, hit a threshold, watch Summon book the gig.

**Description (max 300 chars):**
Summon turns fan demand into real shows. Vote for artists you want to see in your city. When votes hit a threshold — 500 for a club, 2,500 for a theatre, 7,500 for a concert hall, 25,000 for an arena — Summon contacts venues and promoters directly with the numbers. No more hoping your favourite artist figures out you exist. Live now at wesummon.com.

**Tags:**
music, live-events, community, fan-engagement, concerts, marketplace

---

## 3. Peerlist Listing

**Title (max 60 chars):**
Summon — Concert demand platform for fans

**Tagline (max 100 chars):**
Aggregate fan demand, hit vote thresholds, trigger real venue outreach. Fan-powered show booking.

**Description (max 300 chars):**
Summon is a concert demand platform built on Next.js + Supabase. Fans vote for artists in their city. Threshold logic (500/2,500/7,500/25,000 votes) triggers automated venue and promoter outreach via Resend. Programmatic SEO across 1,000+ artist-city pages, Stripe Superfan tier, push notifications via APNS. Live at wesummon.com — iOS app in review.

**Tags:**
music, next-js, supabase, saas, community-platform, live-events, consumer, ios

---

## 4. r/SideProject Post

**Title:**
I built Summon — a platform where fans vote artists to their city and we contact venues when demand hits a threshold

**Body:**

Hey r/SideProject — sharing something I've been building for the past several months.

Summon is a concert demand platform. Fans vote for artists they want to see live in their city. When enough votes accumulate and hit a threshold, Summon automatically contacts local venues and promoters with the real demand numbers to try to get the show booked.

Thresholds: 500 (bar/club), 2,500 (theatre), 7,500 (concert hall), 25,000 (arena).

The insight behind it: artists and their teams don't tour cities they don't think fans exist in. But that demand is real and invisible. Summon makes it visible and actionable.

**Stack:** Next.js (App Router), Supabase (auth + DB + RLS), Stripe (Superfan at $4/mo), Resend (transactional + cron emails), Capacitor (iOS wrapper), Vercel (hosting), Sentry (error tracking), Upstash Redis (rate limiting).

Built programmatic SEO across ~1,000 artist-city pages, an automated promoter outreach system, a referral program, push notifications via APNS, and a leaderboard for top voters per city.

It's live now at wesummon.com. iOS app is in review.

Happy to answer any questions about the build — especially around the Supabase + Capacitor combo for native iOS, which had some interesting constraints around OAuth flows.

---

## 5. Indie Hackers Post

**Title:**
I built a concert demand platform where fans vote artists to their city — here's how it works and what I've learned

**Body:**

I want to share a project I've been heads-down on called Summon (wesummon.com).

**The idea**

Live music has a demand problem that nobody talks about. Artists skip cities not because fans don't exist there — but because nobody can prove they do. Promoters and booking agents rely on gut feel, streaming numbers, and social noise. It's vague. It results in real fans in real cities getting nothing.

Summon's premise is simple: aggregate verifiable fan demand, tie it to specific city + artist combinations, and use it as a direct pitch to venues and promoters when the numbers are strong enough to act on.

**How it works**

Users vote for artists they want to see in their city. Votes accumulate toward one of four thresholds:

- 500 votes — Bar / Club
- 2,500 votes — Theatre
- 7,500 votes — Concert Hall
- 25,000 votes — Arena

When a threshold is crossed, Summon automatically fires an outreach email to relevant venues and promoters in that city, including the vote count and artist data. The fan who pushed it over gets notified. Everyone who voted gets notified.

There's also a "50 votes away" warning email that triggers before a threshold — to rally fans and drive the final push.

**Tech stack**

- Next.js 15 (App Router, TypeScript)
- Supabase (auth, database, RLS, real-time)
- Stripe (Superfan subscription at $4/mo)
- Resend (all transactional + cron emails)
- Capacitor (iOS native wrapper)
- Vercel (hosting + cron jobs)
- Upstash Redis (rate limiting)
- Sentry (error tracking)

**SEO play**

Built ~1,000 programmatic pages at `/live/[artistSlug]/[citySlug]` — each showing live vote counts for that artist-city pair. These pages are all indexed and in the sitemap. Long tail search ("will [artist] come to [city]") should drive organic traffic over time.

**Revenue**

Superfan tier at $4/month via Stripe. Perks: early threshold alerts, Superfan badge on the leaderboard, priority show notifications. Affiliate links for ticket platforms are in progress (Ticketmaster, StubHub, SeatGeek, Songkick) as the main long-term revenue layer.

**Early traction**

Seeded 35 vote combinations across 10 artists to make the platform feel alive on day one. Waitlist built up during the coming-soon phase. iOS app is currently in App Store review.

**What I'm figuring out now**

The hardest part isn't the product — it's distribution. Getting the first few real organic votes per artist-city pair to make the demand visible enough that other fans want to pile on. The referral system and leaderboard are designed to help with this, but it takes seeding.

Would love feedback from anyone who's done community-driven consumer apps, especially around the cold start problem and whether the threshold mechanic is compelling enough to drive repeat visits.

Live at wesummon.com.

---

## 6. Reddit r/concerts Post

**Title:**
This site lets you vote for artists to come to your city and actually contacts venues when enough fans want it — thought this was cool

**Body:**

Not sure if anyone's seen this but I came across wesummon.com and thought it was a genuinely interesting concept.

Basically you vote for artists you want to see live in your city. They have these thresholds — like 500 votes means they reach out to bars and clubs about booking, 2,500 gets theatres, 7,500 concert halls, 25,000 arenas. When enough fans vote and hit a threshold, they actually contact the venues and promoters with the numbers.

The thing that got me is it's not just a "sign this petition" situation. It's demand aggregated by city. So it's actually useful data for a promoter trying to figure out if it's worth booking someone somewhere.

You can see live vote counts for different artist-city combos and watch them climb toward the next level. Some of them are surprisingly close to thresholds already.

Thought this sub would appreciate it. It's free to use and you can log in with Spotify so it pulls your top artists automatically. iOS app is apparently coming soon too.

Anyone else tried it?

---

## 7. Reddit r/indieheads Post

**Title:**
Found a site where you vote for indie artists to tour your city and they actually reach out to venues when enough people want it

**Body:**

This felt relevant to share here — wesummon.com.

The concept: you vote for artists you want to see live in your city. When votes hit certain thresholds (500, 2,500, 7,500, 25,000 — corresponding to different venue sizes), they contact venues and promoters in that city with the real demand numbers.

What I like about it for indie music specifically is that a lot of indie artists skip smaller markets not because the fans aren't there but because nobody can prove it to a booking agent. This gives fans a concrete way to signal demand that's actually useful rather than just tweeting at an artist hoping they notice.

You log in with Spotify and it pulls your top artists so it's pretty fast to set up. You can also search for anyone who isn't in the catalogue.

Some of the vote counts for indie artists in smaller cities are already surprisingly competitive. Worth checking out what's happening in your city.

---

## 8. Reddit r/hiphopheads Post

**Title:**
This platform lets fans vote to bring rap artists to their city — when enough votes hit a threshold they contact venues directly

**Body:**

Came across something worth sharing — wesummon.com.

You vote for artists you want to see perform in your city. When the votes hit a threshold (500 for small venues, up to 25,000 for arenas), Summon actually contacts venues and promoters in that city with the demand data to try to get the show booked.

Hip hop feels like a genre where this actually matters. Some of the biggest artists in the world still skip certain cities on tour — not always because they don't want to come, but because promoters aren't confident the demand is there. This makes the demand visible and hard to ignore.

You can log in with Spotify and it auto-pulls your top artists. Vote for who you actually want to see, in the city you're actually in. iOS app is dropping soon too.

Might be worth stacking votes for whoever you've been waiting on. Some of those counts are closer to thresholds than you'd expect.
