-- Live artists table: populated when admin approves an artist submission
CREATE TABLE IF NOT EXISTS public.live_artists (
  id          text PRIMARY KEY,           -- "da_{submission_id}"
  name        text NOT NULL,
  genre       text NOT NULL,
  subgenre    text,
  trending    boolean DEFAULT false,
  deezer_image text,
  instagram   text,
  spotify     text,
  source_id   uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.live_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read live_artists"
  ON public.live_artists FOR SELECT USING (true);
