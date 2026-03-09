# Summon — Claude Instructions

## Security
When you find a security vulnerability, flag it immediately with a WARNING comment and suggest a secure alternative. Never implement insecure patterns even if asked.

## Stack
- Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase (auth + database), Vercel (hosting), Resend (email)
- Capacitor for iOS native wrapper

## Conventions
- Font: Neue Montreal (variable `--font-neue-montreal`)
- Brand gradient: purple → indigo → blue (`gradient-brand`, `gradient-display`)
- Dark Slate Gray (`#191919`) for card surfaces
- Use `glass` for inner-app pages, `card-solid` for marketing pages
- All API routes under `app/api/` must check Supabase session before returning data
- Static artist catalogue: IDs `"1"`–`"1001"` in `lib/data/artists.ts`
- Community artists: IDs prefixed `da_` or `dz-`
