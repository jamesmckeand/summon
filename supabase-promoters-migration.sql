-- Venue/promoter contacts for automated outreach
create table if not exists public.promoters (
  id               uuid primary key default gen_random_uuid(),
  venue_name       text not null,
  city             text not null,
  country          text,
  capacity         int,
  venue_type       text not null check (venue_type in ('bar', 'club', 'theatre', 'concert_hall', 'arena')),
  booking_email    text,
  website          text,
  talent_buyer     text,
  promoter_company text,
  notes            text,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

create index if not exists promoters_city_idx       on public.promoters (city);
create index if not exists promoters_venue_type_idx on public.promoters (venue_type);
create index if not exists promoters_city_type_idx  on public.promoters (city, venue_type);

-- No RLS needed — admin-only table, accessed via service role only
alter table public.promoters enable row level security;

-- Outreach log — tracks which promoters were emailed for which artist/city/threshold
create table if not exists public.outreach_log (
  id          uuid primary key default gen_random_uuid(),
  artist_id   text not null,
  artist_name text not null,
  city        text not null,
  threshold   int  not null,
  promoter_id uuid references public.promoters(id) on delete set null,
  venue_name  text,
  sent_at     timestamptz not null default now(),
  status      text not null default 'sent' check (status in ('sent', 'replied', 'booked', 'declined'))
);

create index if not exists outreach_log_artist_city_idx on public.outreach_log (artist_id, city, threshold);
create index if not exists outreach_log_promoter_idx    on public.outreach_log (promoter_id);

alter table public.outreach_log enable row level security;
