-- ============================================================================
-- Give a user access to the dashboards
--
-- 1. Create the user first: Authentication → Users → Add user → Create new user
--    (tick "Auto Confirm User").
-- 2. Replace the email below with theirs, then run this in the SQL Editor.
-- ============================================================================

insert into public.admins (user_id, email)
select id, email
from auth.users
where email = 'president@example.com'   -- ← change this
on conflict (user_id) do nothing;

-- Check who has access:
select email, created_at from public.admins order by created_at;

-- To remove someone's access later:
-- delete from public.admins where email = 'someone@example.com';
