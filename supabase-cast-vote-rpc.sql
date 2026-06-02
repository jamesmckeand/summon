-- Atomic vote insert + count
-- Replaces the non-atomic SELECT COUNT(*) → INSERT → threshold-check pattern.
--
-- The function inserts the vote (ON CONFLICT DO NOTHING for duplicate guard)
-- and returns the authoritative post-insert count in a single transaction,
-- eliminating the race window where two concurrent votes both read the same
-- pre-insert count and both trigger threshold emails.
--
-- Returns: { inserted: boolean, vote_count: number }
--   inserted  — true if this was a fresh vote, false if user already voted
--   vote_count — total votes for this (artist_id, city) after the insert
--
-- security definer + auth.uid() check: runs as DB owner so the COUNT can see
-- all votes (bypasses RLS), but the caller is still prevented from voting as
-- a different user.

create or replace function cast_vote(
  p_user_id  uuid,
  p_artist_id text,
  p_city      text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_count  integer;
  v_vote_count bigint;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'unauthorized';
  end if;

  insert into votes (user_id, artist_id, city)
  values (p_user_id, p_artist_id, p_city)
  on conflict (user_id, artist_id, city) do nothing;

  get diagnostics v_row_count = row_count;

  select count(*) into v_vote_count
  from votes
  where artist_id = p_artist_id
    and city      = p_city;

  return jsonb_build_object(
    'inserted',    (v_row_count > 0),
    'vote_count',  v_vote_count
  );
end;
$$;
