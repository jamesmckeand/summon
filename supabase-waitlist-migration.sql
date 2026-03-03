-- Waitlist table — stores signups from the coming-soon page
-- Unique constraint on email prevents duplicate sends

CREATE TABLE IF NOT EXISTS public.waitlist (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email      text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated visitors to join (coming-soon is pre-auth)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT WITH CHECK (true);

-- No SELECT policy — only server-side/admin access needed
