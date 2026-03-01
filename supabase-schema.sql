-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  city text,
  spotify_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Artists
create table public.artists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  spotify_id text unique,
  genre text,
  image_url text,
  created_at timestamptz default now()
);

alter table public.artists enable row level security;

create policy "Anyone can view artists"
  on public.artists for select using (true);

-- Votes
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  city text not null,
  created_at timestamptz default now(),
  unique(user_id, artist_id, city)
);

alter table public.votes enable row level security;

create policy "Users can view all votes"
  on public.votes for select using (true);

create policy "Users can cast their own votes"
  on public.votes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own votes"
  on public.votes for delete using (auth.uid() = user_id);

-- Vote counts view (for leaderboards)
create view public.vote_counts as
  select
    artist_id,
    city,
    count(*) as vote_count
  from public.votes
  group by artist_id, city;

