# Summon — Load Capacity Analysis

## 1. What Each Tier Supports

### Vercel (Free / Pro)
- **Free**: 100GB bandwidth/month, 1M serverless function invocations/month, no concurrent execution cap.
- **Pro** ($20/mo): 1TB bandwidth, unlimited invocations, removes cold-start penalties.
- Neither tier is the binding constraint at early scale. The app is mostly static (explore page, artist pages) with lightweight API routes.

### Supabase (Free tier)
| Limit | Value | Impact |
|---|---|---|
| MAU | 50,000 | Hard auth limit — users over this cannot log in |
| Concurrent DB connections | 60 | Shared across all server-side clients (API routes + realtime) |
| Bandwidth | 2 GB/month | Vote reads are small; only a concern at high traffic |
| DB storage | 500 MB | Votes table grows ~50 bytes/row; 500 MB ≈ 10M votes |

### Resend (Free tier)
- 3,000 emails/month and 100/day hard cap.
- Threshold emails are fire-and-forget and only fire at 4 vote milestones per artist/city pair.
- Resend is not a bottleneck until you have hundreds of threshold crossings per day.

### Deezer API (public, no auth)
- Artist images and tracks are cached 24h in the Next.js fetch cache plus a warm module-level memory cache.
- `/api/artist-images` fans out ~90 Deezer calls but is cached across all users — only runs once per 24h per warm instance.
- No auth means no dedicated rate limit; Deezer's public limit is ~50 req/s per IP. The 24h cache makes this a non-issue.

---

## 2. First Bottleneck: Supabase Connections

**60 connections is the binding constraint.** Here is why:

Each authenticated API route call creates a Supabase server client and holds a connection for the duration of the request:
- `POST /api/votes` — 3 sequential DB calls (auth + count + insert)
- `GET /api/vote-counts` — 1 DB call
- `GET /api/artist-votes` — 1 DB call

Additionally, every user on the explore page or an artist page opens **2 realtime subscriptions** (one in `useVoteCounts`, one in `ArtistClient`). Realtime subscriptions consume connections from the same pool.

At ~20 simultaneously active users browsing artist pages (each holding 2 realtime channels) that is already 40 connections. Add concurrent vote actions and the pool saturates before you hit 50 MAU concurrently active.

**Practical ceiling on free tier: ~50–100 concurrent active users** before DB connection errors begin. MAU can be in the low thousands provided peak concurrency stays under ~25 users.

---

## 3. Upgrade Path

1. **Supabase Pro ($25/mo)** — Raises concurrent connections to 200 (direct) + enables pgBouncer connection pooling (transaction mode gives effective unlimited pooling for serverless). This is the single most impactful upgrade. Unlocks 50k MAU hard cap removal and 8GB storage.
2. **Vercel Pro ($20/mo)** — Only needed once bandwidth exceeds 100GB or you want faster cold starts. Not urgent.
3. **Resend Starter ($20/mo)** — 50k emails/month. Only relevant once threshold emails fire frequently.

Total cost to handle ~10k MAU comfortably: **$45/mo** (Supabase Pro + Vercel Pro).

---

## 4. Quick Wins Without Upgrading

| Action | Benefit |
|---|---|
| **Use Supabase pgBouncer (port 6543) in API routes** | Cuts connection hold time; free tier includes it in transaction mode |
| **Deduplicate realtime subscriptions on explore page** | `useVoteCounts` subscribes to the entire `votes` table, not city-filtered — one channel per explore session is fine but should not also be opened on artist pages for the same city |
| **Cache `/api/vote-counts` at the CDN edge** | Add `Cache-Control: public, s-maxage=10, stale-while-revalidate=30` — vote counts do not need to be real-time on the list view; the realtime subscription already handles live updates client-side |
| **Batch artist-votes on explore** | Explore already uses `useVoteCounts` (one query), which is correct. Confirm no stray per-artist fetches remain |
| **Throttle realtime re-fetch in `useVoteCounts`** | Currently re-fetches on every single postgres change event. Debounce to 500ms to prevent N simultaneous DB queries when a burst of votes arrives |
