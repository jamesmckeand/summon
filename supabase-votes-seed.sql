-- Vote seed data
-- Uses session_replication_role to bypass the user FK constraint for seeding

set session_replication_role = replica;

insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '1',  'London'      from generate_series(1, 47) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '1',  'New York'    from generate_series(1, 41) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '1',  'Los Angeles' from generate_series(1, 38) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '1',  'Toronto'     from generate_series(1, 29) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '1',  'Sydney'      from generate_series(1, 22) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '2',  'London'      from generate_series(1, 39) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '2',  'Los Angeles' from generate_series(1, 34) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '2',  'New York'    from generate_series(1, 31) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '2',  'Melbourne'   from generate_series(1, 18) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '3',  'London'      from generate_series(1, 42) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '3',  'Manchester'  from generate_series(1, 28) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '3',  'New York'    from generate_series(1, 23) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '4',  'New York'    from generate_series(1, 36) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '4',  'London'      from generate_series(1, 28) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '4',  'Chicago'     from generate_series(1, 19) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '8',  'London'      from generate_series(1, 33) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '8',  'New York'    from generate_series(1, 27) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '8',  'Toronto'     from generate_series(1, 21) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '9',  'London'      from generate_series(1, 38) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '9',  'New York'    from generate_series(1, 26) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '9',  'Los Angeles' from generate_series(1, 21) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '16', 'Chicago'     from generate_series(1, 44) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '16', 'New York'    from generate_series(1, 37) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '16', 'Los Angeles' from generate_series(1, 29) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '16', 'London'      from generate_series(1, 24) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '21', 'Los Angeles' from generate_series(1, 43) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '21', 'New York'    from generate_series(1, 31) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '21', 'Atlanta'     from generate_series(1, 25) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '29', 'Toronto'     from generate_series(1, 48) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '29', 'New York'    from generate_series(1, 35) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '29', 'London'      from generate_series(1, 26) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '41', 'Nashville'   from generate_series(1, 52) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '41', 'Austin'      from generate_series(1, 38) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '41', 'Dallas'      from generate_series(1, 27) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '43', 'Nashville'   from generate_series(1, 41) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '43', 'Austin'      from generate_series(1, 33) on conflict do nothing;
insert into public.votes (user_id, artist_id, city) select gen_random_uuid(), '43', 'Denver'      from generate_series(1, 24) on conflict do nothing;

set session_replication_role = default;
