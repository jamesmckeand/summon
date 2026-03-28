-- ── Security Advisor fixes ────────────────────────────────────────────────────
-- Addresses 4 warnings from Supabase Security Advisor (March 2026)
-- Run in Supabase SQL Editor

-- 1. Fix Function Search Path Mutable: update_updated_at
--    Prevents search_path injection by pinning to empty string
create or replace function update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Fix RLS Policy Always True on push_tokens (update)
--    Scope update to token owner only — prevents any user updating any token
drop policy if exists "upsert own token" on public.push_tokens;

create policy "upsert own token" on public.push_tokens
  for update
  using (auth.uid() = user_id);

-- NOTE: "insert own token" policy intentionally uses check (true) to allow
-- unauthenticated token registration (token is the secret). Left as-is.

-- 3. Leaked Password Protection — CANNOT be fixed via SQL.
--    Fix manually: Supabase Dashboard → Authentication → Settings →
--    enable "Leaked Password Protection" (HaveIBeenPwned check).
