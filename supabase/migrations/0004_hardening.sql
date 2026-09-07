-- ===========================================================================
-- Softronics :: 0004_hardening.sql
-- Already applied to the live project. Committed so a fresh database ends up
-- in the same state as production.
--
-- 1. set_updated_at ran with a mutable search_path (Supabase linter 0011).
-- 2. handle_new_auth_user is a trigger function and must never be callable
--    over /rest/v1/rpc (linter 0028/0029).
-- 3. Five foreign keys had no covering index (linter 0001).
-- 4. admin_users policies re-evaluated auth.uid() per row (linter 0003).
-- ===========================================================================

-- 1 ------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2 ------------------------------------------------------------------------
revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.handle_new_auth_user() from anon;
revoke all on function public.handle_new_auth_user() from authenticated;

-- 3 ------------------------------------------------------------------------
create index if not exists media_uploaded_by_idx        on public.media (uploaded_by);
create index if not exists post_tags_tag_id_idx         on public.post_tags (tag_id);
create index if not exists posts_author_id_idx          on public.posts (author_id);
create index if not exists posts_featured_media_id_idx  on public.posts (featured_media_id);
create index if not exists site_settings_updated_by_idx on public.site_settings (updated_by);

-- 4 ------------------------------------------------------------------------
drop policy if exists admin_users_select on public.admin_users;
create policy admin_users_select on public.admin_users
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists admin_users_update_self on public.admin_users;
create policy admin_users_update_self on public.admin_users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = public.my_admin_role());

-- NOTE: is_admin() / is_owner() / my_admin_role() stay executable by anon and
-- authenticated on purpose. RLS policies evaluate as the caller, so revoking
-- EXECUTE would break every policy that uses them. They only ever return facts
-- about the caller, so the remaining linter warnings are expected.
