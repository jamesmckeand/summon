-- Referrals: track who brought whom to Summon
create table if not exists public.referrals (
  id          uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete set null,
  referred_id uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(referred_id) -- one referrer per user; first touch wins
);

alter table public.referrals enable row level security;

-- Users can read their own referral stats
create policy "Users can view referrals they made"
  on public.referrals for select
  using (auth.uid() = referrer_id);

-- Service role inserts only (done server-side in auth callback)
-- No insert policy needed for anon/authenticated — done via service role
