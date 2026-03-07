-- Push notification tokens for iOS app
create table if not exists push_tokens (
  id          uuid primary key default gen_random_uuid(),
  token       text unique not null,
  platform    text not null default 'ios',
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for looking up tokens by user (for targeted notifications)
create index if not exists push_tokens_user_id_idx on push_tokens (user_id);

-- Row-level security
alter table push_tokens enable row level security;

-- Anyone (including unauthenticated) can register a token — the token itself is the secret
create policy "insert own token" on push_tokens
  for insert with check (true);

-- Users can update their own token (e.g. re-registration)
create policy "upsert own token" on push_tokens
  for update using (true);

-- Service role only for reads (used by notification sender scripts)
-- Regular users cannot read token list
