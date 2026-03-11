-- Superfan subscriptions (managed by Stripe webhook)
create table if not exists public.subscriptions (
  id                   text primary key,           -- Stripe subscription ID
  user_id              uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id   text not null,
  status               text not null,              -- active | canceled | past_due | trialing
  price_id             text not null,              -- Stripe price ID
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions (user_id);
create index if not exists subscriptions_customer_idx on subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role only for writes (done via Stripe webhook with admin client)
