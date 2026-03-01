CREATE TABLE public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('artist', 'venue')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Artist fields
  artist_name text,
  artist_genre text,
  artist_subgenre text,
  artist_instagram text,
  artist_spotify text,

  -- Venue fields
  venue_city text,
  venue_name text,
  venue_capacity text CHECK (venue_capacity IN ('small', 'medium', 'large', 'arena')),

  -- Deezer validation (artists)
  deezer_validated boolean DEFAULT false,
  deezer_image text,

  -- Meta
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can submit
CREATE POLICY "Authenticated users can insert submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = submitted_by);

-- Service role (used in admin API) handles all other access
