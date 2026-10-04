-- ============================================================================
-- Vidhi Ekta Sangh — database setup
--
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- It is safe to run again: every statement checks whether it already exists.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Administrators
--    Only users listed here can use the dashboards. Signing up is not enough.
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "Admins can see their own row" on public.admins;
create policy "Admins can see their own row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on table public.admins to authenticated;

-- True when the signed-in user is an administrator. Used by every policy below.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ----------------------------------------------------------------------------
-- 2. Keeps updated_at current on every edit
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- 3. Homepage content
--    One row per section (site, founder, members, …). The website validates
--    each section and falls back to its built-in default when a row is missing.
-- ----------------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add site content" on public.site_content;
create policy "Admins can add site content"
  on public.site_content for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit site content" on public.site_content;
create policy "Admins can edit site content"
  on public.site_content for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete site content" on public.site_content;
create policy "Admins can delete site content"
  on public.site_content for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.site_content to anon, authenticated;
grant insert, update, delete on table public.site_content to authenticated;


-- ----------------------------------------------------------------------------
-- 4. Events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  location    text not null default '',
  start_date  date not null,
  end_date    date check (end_date is null or end_date >= start_date),
  description text not null default '',
  image_url   text not null,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists events_start_date_idx on public.events (start_date desc);

drop trigger if exists events_touch on public.events;
create trigger events_touch
  before update on public.events
  for each row execute function public.touch_updated_at();

alter table public.events enable row level security;

drop policy if exists "Anyone can read published events" on public.events;
create policy "Anyone can read published events"
  on public.events for select
  to anon, authenticated
  using (published or (select public.is_admin()));

drop policy if exists "Admins can add events" on public.events;
create policy "Admins can add events"
  on public.events for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit events" on public.events;
create policy "Admins can edit events"
  on public.events for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.events to anon, authenticated;
grant insert, update, delete on table public.events to authenticated;


-- ----------------------------------------------------------------------------
-- 5. Gallery
-- ----------------------------------------------------------------------------
create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 200),
  category   text not null default 'Events',
  image_url  text not null,
  width      integer not null default 1200 check (width > 0),
  height     integer not null default 800 check (height > 0),
  created_at timestamptz not null default now()
);

create index if not exists gallery_items_created_at_idx on public.gallery_items (created_at desc);

alter table public.gallery_items enable row level security;

drop policy if exists "Anyone can read the gallery" on public.gallery_items;
create policy "Anyone can read the gallery"
  on public.gallery_items for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can add photos" on public.gallery_items;
create policy "Admins can add photos"
  on public.gallery_items for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit photos" on public.gallery_items;
create policy "Admins can edit photos"
  on public.gallery_items for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete photos" on public.gallery_items;
create policy "Admins can delete photos"
  on public.gallery_items for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.gallery_items to anon, authenticated;
grant insert, update, delete on table public.gallery_items to authenticated;


-- ----------------------------------------------------------------------------
-- 6. Image storage
--    A public bucket: anyone can view images, only admins can change them.
--    10 MB per file; the dashboard resizes large photos before uploading.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can view media files" on storage.objects;
create policy "Admins can view media files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins can upload media" on storage.objects;
create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins can replace media" on storage.objects;
create policy "Admins can replace media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

drop policy if exists "Admins can delete media" on storage.objects;
create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
