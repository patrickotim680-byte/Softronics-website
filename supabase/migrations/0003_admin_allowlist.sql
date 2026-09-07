-- ===========================================================================
-- Softronics :: 0003_admin_allowlist.sql
-- Authorized administrator accounts (configuration, not credentials).
--
-- IMPORTANT: this file contains NO passwords. It only records which email
-- addresses are permitted to hold an admin account. The actual account is
-- created in Supabase Auth (dashboard or `npm run admin:create`), where the
-- password is set securely and never stored in this repository.
--
-- When a Supabase auth user is created with an allowlisted email, the trigger
-- below automatically creates the matching public.admin_users row.
-- ===========================================================================

insert into public.admin_allowlist (email, role, note) values
  ('otimg197@gmail.com', 'owner', 'Initial Softronics administrator'),
  ('odan8897@gmail.com', 'owner', 'Initial Softronics administrator')
on conflict (email) do update
  set role = excluded.role,
      note = excluded.note;

-- ---------------------------------------------------------------------------
-- Auto-provision an admin profile for allowlisted sign-ups.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed public.admin_allowlist;
begin
  select * into allowed
  from public.admin_allowlist
  where lower(email) = lower(new.email);

  if allowed.email is not null then
    insert into public.admin_users (id, email, full_name, role, is_active)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
      allowed.role,
      true
    )
    on conflict (id) do update
      set email = excluded.email,
          is_active = true;
  end if;

  return new;
end;
$$;

do $$
begin
  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_auth_user();
exception
  when insufficient_privilege then
    raise notice 'Could not attach trigger to auth.users. Insert admin_users rows manually or run scripts/create-admin.mjs.';
end;
$$;

-- ---------------------------------------------------------------------------
-- Backfill: promote any existing auth users that are on the allowlist.
-- ---------------------------------------------------------------------------
insert into public.admin_users (id, email, full_name, role, is_active)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
       a.role,
       true
from auth.users u
join public.admin_allowlist a on lower(a.email) = lower(u.email)
on conflict (id) do nothing;
