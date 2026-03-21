# Summon — Launch Copy

---

## App Store Submission Checklist

| Item | Status | Notes |
|------|--------|-------|
| Privacy policy | ✅ | /privacy — updated with all third-party SDKs |
| Terms & conditions | ✅ | /terms |
| EULA | ✅ | Uses Apple's standard EULA — link added to /superfan |
| Paywall disclaimer | ✅ | Superfan is soft paywall — app fully usable without it |
| Screenshots show actual app | ⬜ | Needs design work |
| Paid Apps Agreement | ⬜ | Accept in App Store Connect → Business section (one-time) |
| Paywall page links to privacy/terms | ✅ | Added to /superfan |
| ASO app name | ✅ | "Summon — Vote Artists to Your City" |
| Promotional text | ✅ | In this file below |
| Demo account for Apple reviewers | ⬜ | Create: reviewer@wesummon.com / Summon2026! — vote for Taylor Swift in London, then share with Apple |
| Apple Sign In | ✅ | Implemented |
| Age ratings | ⬜ | Set in App Store Connect — likely 4+ |
| App encryption documentation | ⬜ | Select "Yes, exempt" (uses standard HTTPS) in App Store Connect |
| Data collection disclaimers | ✅ | /privacy updated with Stripe, Sentry, APNS, Deezer |
| Crash tracking disclosure | ✅ | Sentry listed in /privacy |
| User identifiers | ✅ | Email, name, device token all listed in /privacy |
| Icon 1024×1024 | ⬜ | Waiting on design |
| IAP submitted with binary | ⬜ | Add Superfan $4/mo subscription in App Store Connect before submitting |
| IAP description & localisation | ⬜ | Write in App Store Connect |
| Accessibility | ⬜ | Audit VoiceOver labels, dynamic text — can handle before TestFlight |
| Localised pricing | ⬜ | Set automatically by App Store if you select "Proceed" |

---

## App Store Description

**Vote artists to your city. Make shows happen.**

Summon is a live music demand platform. You vote for artists you want to see perform in your city. When enough fans vote, Summon contacts venues and promoters directly with the demand data — so the show actually gets booked.

Artists and promoters don't always know where real fan demand exists. Summon makes it visible, loud, and impossible to ignore.

**Here's how it works:**

Vote for any artist in your city. Every vote counts toward a venue threshold:

- 500 votes — Bar / Club
- 2,500 votes — Theatre
- 7,500 votes — Concert Hall
- 25,000 votes — Arena

When a threshold is crossed, Summon reaches out to venues and promoters in that city with the real numbers. No guessing. No hoping. Just data they can act on.

**You'll know when it matters.**

Get notified the moment a threshold is crossed. If you voted for an artist who just hit 500 votes in your city, you're first to know — and first in line when tickets drop.

**Spotify login — zero setup.**

Sign in with Spotify and Summon instantly pulls your top artists. Your demand is on the map in under a minute.

**See where the demand is building.**

Browse live vote counts across artists and cities. Watch progress bars climb toward the next threshold. See which combos are close — and push them over.

**Superfan ($4/month)**

Get early alerts before thresholds go public, a Superfan badge on the leaderboard, and priority notifications when artists you voted for confirm shows.

**Leaderboard**

Top voters in every city are ranked. This is for the fans who show up.

**Referral system**

Share your link. When the people you bring in vote, your referral count grows. The more fans in the room, the louder the signal.

**Shows page**

Confirmed events in one place. When the demand turns into a real show, it lives here.

---

Summon was built for fans who are tired of watching artists skip their city. Not because the demand wasn't there — but because nobody knew about it.

Now they'll know.

Download Summon. Vote your city. Make it happen.

wesummon.com

---

## App Store Subtitle

Vote artists to your city

*(29 characters)*

---

## App Store Keywords

concert,live music,vote,artist,shows,tour,tickets,demand,gig,festival,music fan,booking,local shows

*(99 characters)*

---

## Promotional Text

Thousands of fans are already voting. Is your city on the map? Download and add your voice.

*Update with real numbers once you have them, e.g:*
12,400 votes cast. 6 cities close to a threshold. Add yours — wesummon.com

---

## Product Hunt Tagline

Vote artists to your city. Make shows happen.

*(46 characters)*

---

## Product Hunt Description

I've watched artists skip my city on tour for years. Not once, over and over. And every time I'd think: they just don't know we're here.

That's why I built Summon.

Summon is a live music demand platform. Fans vote for artists they want to see perform in their city. When votes hit a threshold — 500 for a bar, 2,500 for a theatre, 7,500 for a concert hall, 25,000 for an arena — Summon contacts venues and promoters directly with the demand data to help make the show happen.

The insight is simple: artists and promoters make routing decisions based on incomplete information. They look at streaming numbers, ticket sales history, social following. But none of that tells them there are 4,000 people in Glasgow who would buy tickets to a show tonight if someone just booked it. Summon captures that signal and puts it in front of the people who can act on it.

Here's how it works for fans: you log in (Spotify login imports your top artists automatically), vote for artists in your city, and watch the progress bar climb. When a threshold crosses, you get notified and Summon fires outreach to local venues and promoters with the real numbers.

There's a Superfan tier ($4/mo) for early alerts, a leaderboard of top voters per city, a referral system, and a confirmed shows page when demand turns into a real booking.

We've seeded the platform with real vote data across 10 artists and 35 city combos, and we're launching today.

I'd genuinely love your feedback — especially if you've ever been frustrated that an artist you love just never comes to your city.

wesummon.com

---

## Reddit Posts

### r/SideProject

**Title:** I built a platform that turns fan demand into actual concert bookings — here's how it works

**Body:**

Side project I've been working on for a while. The idea came from a genuinely frustrating experience: artists I love tour North America and Europe and completely skip my city, every time.

The problem isn't lack of fans. It's that venues and promoters don't have a way to see concentrated local demand before committing to a booking. Streaming numbers and social follows don't tell you that 3,000 people in a specific city would buy tickets tonight.

So I built Summon.

Fans vote for artists they want to see in their city. Votes accumulate toward venue thresholds (500 = bar/club, 2,500 = theatre, 7,500 = concert hall, 25,000 = arena). When a threshold is crossed, Summon automatically contacts venues and promoters in that city with the real demand numbers.

The stack: Next.js, Supabase, Resend for emails, Vercel for deployment. iOS app is coming. Spotify login pulls in your top artists automatically so there's no friction to get started.

There's a Superfan tier, a referral system, a leaderboard, and a shows page for confirmed events.

Biggest challenge was getting the outreach side right — building a database of venue contacts, writing copy that venues would actually read, and making sure the data we're sending them is clean and credible.

Happy to answer questions about the build. And if you want to try it: wesummon.com

---

### r/concerts

**Title:** What if the reason your favourite artist never comes to your city is that nobody told them you want them there?

**Body:**

This has been sitting in my head for a long time.

Artists and promoters make routing decisions based on data: streaming numbers in a market, historical ticket sales, social following by region. What they don't have is direct, concentrated signal from fans saying "we are here, we will buy tickets, come to our city."

I built something to fix that. It's called Summon.

You vote for artists you want to see in your city. When enough fans vote, Summon contacts local venues and promoters with the real demand data. The thresholds: 500 votes to trigger outreach at bar/club level, 2,500 for a theatre, 7,500 for a concert hall, 25,000 for an arena.

It's not a petition. It's not a tweet at an artist. It's an actual demand signal sent directly to the people who book shows, with numbers they can use.

You get notified when a threshold is crossed. Confirmed shows live on the platform.

If you've ever refreshed an artist's tour dates hoping your city finally showed up, this is for you.

wesummon.com — free to use, Spotify login makes it instant.

---

### r/indieheads

**Title:** Built a site where you vote for indie artists to come to your city — and it actually contacts promoters when enough people vote

**Body:**

Long-time lurker here, posting because I think this community specifically would get it.

Indie and alternative artists are the worst for city-skipping. Labels don't push for routing in secondary markets unless there's a clear commercial case. So artists who have passionate but geographically spread fanbases end up on tours that hit 8 cities and call it a world tour.

I built Summon to try to change that.

The mechanic: fans vote for artists in their city. Votes accumulate toward thresholds. When a threshold is crossed, the platform contacts venues and promoters in that city with the demand data directly. No intermediary, no petition form that goes nowhere — actual outreach to the people who can book the show.

Thresholds are sized to venue capacity: 500 votes = bar/club, 2,500 = theatre, 7,500 = concert hall, 25,000 = arena. So even a cult favorite with 600 dedicated fans in a city has a realistic path to a show.

Spotify login works — it pulls your top artists so you can vote without manually searching for every band you like.

Would love to know which artists this community would want to push. Drop them below if you're curious what the vote count looks like in your city.

wesummon.com

---

### r/hiphopheads

**Title:** Made something for every hip-hop fan whose city keeps getting skipped on tours

**Body:**

Real talk: hip-hop tours in 2025 hit New York, LA, Chicago, Atlanta, Toronto, and that's usually it. If you're anywhere else, you're watching everyone else post concert clips.

I built Summon because I got tired of it.

Here's the deal: you vote for artists you want to see perform in your city. When enough people vote, Summon contacts venues and promoters in that city with the demand numbers. Real outreach, not a petition. The threshold to trigger bar/club level outreach is 500 votes. Theatre is 2,500. Concert Hall is 7,500. Arena is 25,000.

Spotify login is built in so it pulls your listening history and suggests artists automatically. Takes about a minute to get started.

There's also a leaderboard of top voters per city — if you're putting in work getting your city on the map, it shows.

Not saying this gets your favourite artist booked overnight. But right now, the demand data doesn't exist in any form that venues and promoters can use. This is the start of changing that.

wesummon.com — free to use.

---

### r/london (city sub template)

**Title:** Built a platform to show artists how much demand there is for them in London — vote counts go directly to promoters

**Body:**

London gets good shows, but we still get skipped constantly by mid-size artists who don't realise the demand is here. Plenty of artists with cult followings in this city never make it over because the promoter didn't have the data to justify the booking.

I built something called Summon that tries to fix this. You vote for artists you want to see in London. When votes hit a threshold, Summon sends the real demand numbers directly to London venues and promoters.

Thresholds: 500 votes gets outreach going at bar/club level. 2,500 for a theatre booking. 7,500 for a proper concert hall. The data goes to the people who can actually act on it.

Spotify login pulls in your top artists automatically — easy to get started.

If you want to put London on the map for an artist that keeps flying over us, this is how.

wesummon.com

*Template: swap "London" for any city. Adjust local flavour — e.g. for r/toronto: "We have one of the best music scenes in North America and still get treated like a secondary market."*

---

## X / Twitter Launch Day Posts

**Post 1 — Vote total (post first)**

We just launched Summon. Fans are already voting for artists in their cities.

Every vote is a data point. Every data point goes to a venue or promoter when the threshold hits.

This is what fan demand looks like when it's impossible to ignore.

wesummon.com

---

**Post 2 — Top city/artist combo (2 hours later)**

The top combo on Summon right now is getting close to the theatre threshold.

2,500 votes = Summon contacts the venues. The promoters see the number. The show gets real.

We're not there yet. But we're close.

Add your vote: wesummon.com

---

**Post 3 — Mission (2 hours after post 2)**

Artists skip cities all the time. Not because the fans aren't there.

Because nobody told them.

I built Summon to fix that. Vote for artists in your city. When enough people vote, we contact venues directly with the demand data.

Fans shouldn't have to just hope. They should be able to prove it.

wesummon.com

---

## Fan Community Admin DM

Hey — I run a platform called Summon (wesummon.com) where fans vote for artists to come to their city. When votes hit a threshold, we contact local venues and promoters directly with the demand data to help make shows happen.

Given how passionate this community is about [artist name], I thought fans here would want to know it exists. If you're willing to share it, I think your community would get real value from it.

No strings, just wanted to put it on your radar. Happy to answer any questions.

— James
