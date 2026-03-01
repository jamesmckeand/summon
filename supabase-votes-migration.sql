BEGIN;
DROP VIEW public.vote_counts;
ALTER TABLE public.votes DROP CONSTRAINT votes_artist_id_fkey;
ALTER TABLE public.votes ALTER COLUMN artist_id TYPE text USING artist_id::text;
CREATE VIEW public.vote_counts AS
  SELECT
    artist_id,
    city,
    count(*) AS vote_count
  FROM public.votes
  GROUP BY artist_id, city;
COMMIT;
