ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favourite_venues text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS favourite_artists text[] DEFAULT '{}';
