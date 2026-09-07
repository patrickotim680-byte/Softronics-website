-- ===========================================================================
-- Softronics :: 0002_rls.sql
-- Row Level Security. The database is the last line of defence: even if an
-- application check is bypassed, anon keys can only ever read published content.
--
-- Rules
--   anon / authenticated : read published posts, published products/projects,
--                          taxonomies and site_settings. Nothing else.
--   admins (admin_users) : full read/write on content tables.
--   service_role         : bypasses RLS entirely (server-only operations such as
--                          contact-form inserts and provisioning scripts).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Helper predicates. SECURITY DEFINER so policies on admin_users do not recurse.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.id = auth.uid()
      and a.is_active
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.id = auth.uid()
      and a.is_active
      and a.role = 'owner'
  );
$$;

-- Returns the caller's role without triggering RLS recursion on admin_users.
create or replace function public.my_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select a.role from public.admin_users a where a.id = auth.uid();
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_owner() to anon, authenticated, service_role;
revoke all on function public.my_admin_role() from public;
grant execute on function public.my_admin_role() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere. Tables with RLS on and no policy deny all access.
-- ---------------------------------------------------------------------------
alter table public.admin_users      enable row level security;
alter table public.admin_allowlist  enable row level security;
alter table public.categories       enable row level security;
alter table public.tags             enable row level security;
alter table public.media            enable row level security;
alter table public.posts            enable row level security;
alter table public.post_tags        enable row level security;
alter table public.products         enable row level security;
alter table public.projects         enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings    enable row level security;

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists admin_users_update_self on public.admin_users;
create policy admin_users_update_self on public.admin_users
  for update to authenticated
  using (id = auth.uid())
  -- an admin may edit their own profile but cannot escalate their own role
  with check (id = auth.uid() and role = public.my_admin_role());

drop policy if exists admin_users_manage on public.admin_users;
create policy admin_users_manage on public.admin_users
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ---------------------------------------------------------------------------
-- admin_allowlist :: owners only. Never readable by the public.
-- ---------------------------------------------------------------------------
drop policy if exists admin_allowlist_read on public.admin_allowlist;
create policy admin_allowlist_read on public.admin_allowlist
  for select to authenticated
  using (public.is_admin());

drop policy if exists admin_allowlist_manage on public.admin_allowlist;
create policy admin_allowlist_manage on public.admin_allowlist
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ---------------------------------------------------------------------------
-- categories / tags :: public read, admin write
-- ---------------------------------------------------------------------------
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated using (true);

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists tags_public_read on public.tags;
create policy tags_public_read on public.tags
  for select to anon, authenticated using (true);

drop policy if exists tags_admin_write on public.tags;
create policy tags_admin_write on public.tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- posts :: only published articles with a past publication date are public.
-- Drafts are invisible to anon keys at the database level.
-- ---------------------------------------------------------------------------
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts
  for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= now());

drop policy if exists posts_admin_read on public.posts;
create policy posts_admin_read on public.posts
  for select to authenticated using (public.is_admin());

drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists post_tags_public_read on public.post_tags;
create policy post_tags_public_read on public.post_tags
  for select to anon, authenticated using (true);

drop policy if exists post_tags_admin_write on public.post_tags;
create policy post_tags_admin_write on public.post_tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- products / projects
-- ---------------------------------------------------------------------------
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon, authenticated using (is_published = true);

drop policy if exists products_admin_read on public.products;
create policy products_admin_read on public.products
  for select to authenticated using (public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects
  for select to anon, authenticated using (is_published = true);

drop policy if exists projects_admin_read on public.projects;
create policy projects_admin_read on public.projects
  for select to authenticated using (public.is_admin());

drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- media :: rows are admin-only. Public delivery happens through the public
-- Storage bucket URL, so the website never needs to read this table.
-- ---------------------------------------------------------------------------
drop policy if exists media_admin_all on public.media;
create policy media_admin_all on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- contact_messages :: no anon access at all. Inserts happen server-side with
-- the service role after validation, which keeps the public API from being
-- used as a spam endpoint.
-- ---------------------------------------------------------------------------
drop policy if exists contact_messages_admin_all on public.contact_messages;
create policy contact_messages_admin_all on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings :: public read (drives editable website copy), admin write.
-- Never store secrets here.
-- ---------------------------------------------------------------------------
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for the media library.
-- Public read so <Image> can serve files; writes restricted to admins.
-- Wrapped in exception handling because managed environments occasionally
-- restrict DDL on the storage schema.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

do $$
begin
  execute 'drop policy if exists media_public_read on storage.objects';
  execute $p$
    create policy media_public_read on storage.objects
      for select to anon, authenticated
      using (bucket_id = 'media')
  $p$;

  execute 'drop policy if exists media_admin_insert on storage.objects';
  execute $p$
    create policy media_admin_insert on storage.objects
      for insert to authenticated
      with check (bucket_id = 'media' and public.is_admin())
  $p$;

  execute 'drop policy if exists media_admin_update on storage.objects';
  execute $p$
    create policy media_admin_update on storage.objects
      for update to authenticated
      using (bucket_id = 'media' and public.is_admin())
  $p$;

  execute 'drop policy if exists media_admin_delete on storage.objects';
  execute $p$
    create policy media_admin_delete on storage.objects
      for delete to authenticated
      using (bucket_id = 'media' and public.is_admin())
  $p$;
exception
  when insufficient_privilege then
    raise notice 'Storage policies skipped: create them from Storage -> Policies in the Supabase dashboard.';
end;
$$;
