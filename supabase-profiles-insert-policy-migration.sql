-- Close the RLS gap on profiles: the trigger creates the row automatically on
-- signup (security definer, bypasses RLS), but if the trigger ever fails the
-- profile PATCH upsert would silently error. This policy allows users to
-- insert their own row as a fallback.

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
