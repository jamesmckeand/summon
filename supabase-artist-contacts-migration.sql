-- Artist Contacts: booking agents and managers for artists on Summon
-- Run this in the Supabase SQL Editor

-- ── artist_contacts ──────────────────────────────────────────────────────────
create table if not exists artist_contacts (
  id                   uuid primary key default gen_random_uuid(),
  artist_id            text not null,          -- matches ARTISTS id or da_/dz- prefix
  artist_name          text not null,
  manager_name         text,
  manager_email        text,
  booking_agent_name   text,
  booking_agent_email  text,
  agency               text,                   -- e.g. CAA, WME, UTA, Paradigm
  label                text,                   -- record label if known
  facebook_url         text,                   -- official Facebook page URL
  notes                text,
  source               text,                   -- where the contact info was found
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Ensure one contact record per artist (can upsert on artist_id)
create unique index if not exists artist_contacts_artist_id_idx on artist_contacts(artist_id);

-- ── artist_contact_log ───────────────────────────────────────────────────────
-- Tracks when each artist hit a threshold and whether we've followed up
create table if not exists artist_contact_log (
  id              uuid primary key default gen_random_uuid(),
  artist_id       text not null,
  artist_name     text not null,
  city            text not null,
  threshold       int  not null,
  tier            text not null,
  vote_count      int  not null,
  -- Contact info snapshotted at the time of the milestone
  manager_name    text,
  manager_email   text,
  booking_agent_name  text,
  booking_agent_email text,
  agency          text,
  -- Pipeline status
  status          text not null default 'new',  -- new | contacted | replied | booked | declined
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Prevent duplicate log entries for same artist/city/threshold
create unique index if not exists artist_contact_log_unique_idx
  on artist_contact_log(artist_id, city, threshold);

create index if not exists artist_contact_log_status_idx on artist_contact_log(status);
create index if not exists artist_contact_log_artist_idx  on artist_contact_log(artist_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table artist_contacts     enable row level security;
alter table artist_contact_log  enable row level security;

-- No public reads — admin only (service role key bypasses RLS)
-- Artists/managers should not be able to see each other's contact info

-- ── updated_at trigger ───────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artist_contacts_updated_at    on artist_contacts;
drop trigger if exists artist_contact_log_updated_at on artist_contact_log;

create trigger artist_contacts_updated_at
  before update on artist_contacts
  for each row execute function update_updated_at();

create trigger artist_contact_log_updated_at
  before update on artist_contact_log
  for each row execute function update_updated_at();
