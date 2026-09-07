-- ===========================================================================
-- Softronics :: 0001_init.sql
-- Core schema. Safe to run once on a fresh Supabase/Postgres project.
--
-- Conventions
--   * uuid primary keys (gen_random_uuid from pgcrypto)
--   * every table carries created_at / updated_at (timestamptz, UTC)
--   * enumerations are text + CHECK constraints rather than Postgres enums,
--     so adding a value later is a one-line migration instead of a type rebuild
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_users :: application-level profile for a Supabase auth user.
-- Row existence + is_active is what grants access to /admin.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  is_active   boolean not null default true,
  last_seen_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.admin_users is 'Authorized dashboard users. Mirrors auth.users by id.';

-- ---------------------------------------------------------------------------
-- admin_allowlist :: emails permitted to become admins. Populated by
-- 0003_admin_allowlist.sql and editable from the dashboard (Team). Contains no
-- secrets: passwords live only in Supabase Auth.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_allowlist (
  email       text primary key,
  role        text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories / tags
-- kind separates post taxonomies from product taxonomies.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null,
  kind        text not null default 'post' check (kind in ('post', 'product', 'project')),
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (kind, slug)
);

create table if not exists public.tags (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media :: metadata for objects stored in Supabase Storage.
-- Binary data never lives in Postgres or in the git repository.
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  bucket      text not null default 'media',
  path        text not null,
  url         text not null,
  filename    text not null,
  mime_type   text,
  size_bytes  bigint,
  width       integer,
  height      integer,
  alt_text    text,
  uploaded_by uuid references public.admin_users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (bucket, path)
);

-- ---------------------------------------------------------------------------
-- posts :: Insights articles. Content is Markdown.
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  slug               text not null unique,
  excerpt            text,
  content            text not null default '',
  featured_image_url text,
  featured_media_id  uuid references public.media (id) on delete set null,
  author_id          uuid references public.admin_users (id) on delete set null,
  author_name        text,
  category_id        uuid references public.categories (id) on delete set null,
  status             text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at       timestamptz,
  seo_title          text,
  seo_description    text,
  reading_minutes    integer,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id  uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- products :: Softronics products/platforms. CMS driven, never hard-coded.
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  short_description text,
  description       text,
  logo_url          text,
  image_url         text,
  category          text,
  status            text not null default 'concept'
    check (status in ('concept', 'research', 'in_development', 'coming_soon', 'available', 'archived')),
  features          text[] not null default '{}',
  website_url       text,
  cta_label         text,
  cta_url           text,
  is_featured       boolean not null default false,
  is_published      boolean not null default false,
  sort_order        integer not null default 0,
  seo_title         text,
  seo_description   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_published_idx
  on public.products (is_published, sort_order, created_at desc);

-- ---------------------------------------------------------------------------
-- projects :: delivered or in-flight client/internal work. Kept separate from
-- products because a project is an engagement, a product is a Softronics asset.
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  summary      text,
  description  text,
  sector       text,
  status       text not null default 'in_progress'
    check (status in ('planned', 'in_progress', 'delivered', 'internal', 'archived')),
  year         integer,
  image_url    text,
  is_published boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- contact_messages :: contact form submissions.
-- Inserted server-side after validation; never writable by anon API keys.
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  organization text,
  email        text not null,
  phone        text,
  inquiry_type text not null default 'general'
    check (inquiry_type in ('general', 'project', 'partnership', 'support', 'careers')),
  message      text not null,
  status       text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  source       text default 'website',
  user_agent   text,
  ip_hash      text,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists contact_messages_status_idx
  on public.contact_messages (status, created_at desc);

-- ---------------------------------------------------------------------------
-- site_settings :: editable site copy and configuration as key/value JSON.
-- One row per logical group (e.g. 'general', 'home_hero', 'about').
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_users', 'categories', 'media', 'posts', 'products',
    'projects', 'contact_messages', 'site_settings'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t);
  end loop;
end;
$$;
