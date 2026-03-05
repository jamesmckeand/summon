# SECURITY.md — AI Agent Constraints for Summon

This file defines rules for AI coding agents (Claude Code, Copilot, Cursor, etc.) working in this codebase.
Agents MUST follow these constraints. Humans may override them explicitly.

---

## NEVER do without explicit human approval

- **Delete or drop database tables, columns, or migrations** — schema changes are irreversible on production data
- **Modify RLS policies** on `votes`, `profiles`, `waitlist`, or any auth-related table
- **Change or remove authentication flows** (`/app/auth/`, `/app/login/`, `/lib/supabase/`)
- **Push to `main` / trigger a deployment** — all deploys must be human-initiated
- **Modify environment variables** or `.env*` files
- **Add new third-party OAuth providers** — requires Supabase dashboard configuration
- **Remove rate limiting** from `/app/api/votes/route.ts`
- **Change the affiliate URL wrapper** in `lib/affiliate.ts` — revenue-critical
- **Send emails via Resend** outside of the existing `sendThresholdEmail` / `sendOutreachAlert` functions
- **Expose user PII** (email, IP, auth metadata) in API responses or logs

---

## ALWAYS do

- **Validate artist IDs and city names** against `VALID_ARTIST_IDS` and `VALID_CITIES` before any DB write
- **Check auth** (`supabase.auth.getUser()`) at the top of every authenticated API route
- **Use the Supabase server client** (`@/lib/supabase/server`) in route handlers — never the browser client
- **Add `Cache-Control` headers** to read-only API routes that don't require auth
- **Keep Deezer as the image/tracks source** — Spotify API is 403-restricted for this app
- **Fire notification emails fire-and-forget** (`.catch(() => {})`) — never block API responses on email delivery

---

## Sensitive files — treat with extra care

| File / Path | Why sensitive |
|---|---|
| `app/api/votes/route.ts` | Rate limiting + threshold email triggers |
| `app/api/admin/route.ts` | No auth guard — admin-only, internal use |
| `lib/supabase/server.ts` | Auth client setup |
| `app/auth/callback/route.ts` | OAuth redirect logic |
| `supabase-security-fixes.sql` | Applied once — do not re-run blindly |
| `.env.local` | Never commit, never log |

---

## Known intentional decisions — don't "fix" these

- `ipThrottle` is an in-memory Map (not Redis) — intentional, acceptable for current scale
- `vote_counts` view uses `security_invoker = true` — required, do not change
- Marquee falls back to deterministic fake votes — intentional UX for zero-data state
- `app/coming-soon/page.tsx` exists alongside the live app — kept for future use

---

## Safe to modify freely

- `lib/data/artists.ts` — add/edit artist entries
- `lib/data/cities.ts` — add/edit city entries
- `lib/data/venues.ts` — add/edit venue entries
- `components/` — UI components (except Nav auth logic)
- `app/(marketing pages)/` — terms, privacy, about, coming-soon
- `public/` — static assets
- `app/globals.css` — styles and animations
