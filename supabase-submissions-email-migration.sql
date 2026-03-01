-- Add submitter_email column to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS submitter_email text;
