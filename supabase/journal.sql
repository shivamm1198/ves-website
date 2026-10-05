-- ============================================================================
-- Student Journal: articles with attached documents
--
-- Run this once in Supabase → SQL Editor → New query → Run.
-- (Already included in schema.sql for brand-new projects.) Safe to re-run.
-- ============================================================================

create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  title         text not null check (char_length(title) between 1 and 250),
  author_name   text not null default '',
  author_detail text not null default '',
  category      text not null default '',
  summary       text not null default '',
  body          text not null default '',
  cover_url     text not null default '',
  document_url  text not null default '',
  document_name text not null default '',
  published     boolean not null default true,
  published_on  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_published_on_idx on public.articles (published_on desc);

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch
  before update on public.articles
  for each row execute function public.touch_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
  on public.articles for select
  to anon, authenticated
  using (published or (select public.is_admin()));

drop policy if exists "Admins can add articles" on public.articles;
create policy "Admins can add articles"
  on public.articles for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can edit articles" on public.articles;
create policy "Admins can edit articles"
  on public.articles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete articles" on public.articles;
create policy "Admins can delete articles"
  on public.articles for delete
  to authenticated
  using ((select public.is_admin()));

grant select on table public.articles to anon, authenticated;
grant insert, update, delete on table public.articles to authenticated;

-- Public bucket for the attached papers (PDF and Word, up to 20 MB each).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  true,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can view documents" on storage.objects;
create policy "Admins can view documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()));

drop policy if exists "Admins can upload documents" on storage.objects;
create policy "Admins can upload documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents' and (select public.is_admin()));

drop policy if exists "Admins can replace documents" on storage.objects;
create policy "Admins can replace documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()))
  with check (bucket_id = 'documents' and (select public.is_admin()));

drop policy if exists "Admins can delete documents" on storage.objects;
create policy "Admins can delete documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents' and (select public.is_admin()));
