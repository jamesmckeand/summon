-- ─────────────────────────────────────────────────────────────
-- Security Advisor fixes
-- Run this in Supabase SQL editor, then hit "Rerun linter"
-- ─────────────────────────────────────────────────────────────

-- ① Fix: Security Definer View → vote_counts
--    Recreate with SECURITY INVOKER so the view respects RLS
--    policies of the querying user, not the view creator.
DROP VIEW IF EXISTS public.vote_counts;

CREATE VIEW public.vote_counts
  WITH (security_invoker = true)
AS
  SELECT
    artist_id,
    city,
    count(*) AS vote_count
  FROM public.votes
  GROUP BY artist_id, city;

-- Re-grant read access to authenticated and anon roles
GRANT SELECT ON public.vote_counts TO authenticated, anon;


-- ② Fix: RLS Policy Always True → public.waitlist
--    Current policy: WITH CHECK (true) — overly permissive.
--    Tighten to require a non-empty, plausibly valid email.
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) > 0
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );


-- ③ Leaked Password Protection — cannot be fixed via SQL.
--    Enable it in the Supabase dashboard:
--    Authentication → Settings → scroll to "Password Protection"
--    → toggle ON "Leaked password protection (HaveIBeenPwned)"
--
--    Note: the app currently uses magic links + OAuth so users
--    don't set passwords, but enabling this is still best practice
--    in case password auth is added later.
