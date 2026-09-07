-- ===========================================================================
-- Softronics :: seed.sql  (OPTIONAL DEVELOPMENT DATA)
--
-- Purpose: give a freshly created database enough content that every page,
-- empty state and CMS flow can be exercised immediately.
--
-- What is in here:
--   * Real Softronics positioning copy (safe to keep).
--   * Two placeholder product entries with honest statuses. These are examples
--     of structure only. Replace or delete them from /admin/products.
--   * One published and one draft Insights article, both written as opinion /
--     philosophy pieces so nothing untrue is published.
--
-- What is deliberately NOT in here: fake customers, testimonials, partners,
-- awards, team members, offices, metrics or case studies.
--
-- Every seeded row is tagged in site_settings.demo so you can find and remove
-- it later. Re-running this file is safe (idempotent upserts).
-- ===========================================================================

-- --- taxonomies -------------------------------------------------------------
insert into public.categories (name, slug, kind, description) values
  ('Engineering',   'engineering',   'post',    'How we build, and the decisions behind it.'),
  ('Product',       'product',       'post',    'Notes on turning problems into products.'),
  ('Company',       'company',       'post',    'Softronics direction and thinking.'),
  ('Education',     'education',     'product', 'Software for schools and learning institutions.'),
  ('Business',      'business',      'product', 'Operational software for small and mid-sized businesses.')
on conflict (kind, slug) do update set name = excluded.name, description = excluded.description;

insert into public.tags (name, slug) values
  ('Africa', 'africa'),
  ('Practical software', 'practical-software'),
  ('AI', 'ai'),
  ('Engineering', 'engineering-tag')
on conflict (slug) do nothing;

-- --- products (placeholder structure, honest statuses) ----------------------
insert into public.products
  (name, slug, short_description, description, category, status, features,
   cta_label, cta_url, is_featured, is_published, sort_order, seo_title, seo_description)
values
  (
    'Softronics Education',
    'softronics-education',
    'A school operations platform for African institutions: students, attendance, results and fees in one place.',
    E'Softronics Education is an early-stage platform aimed at the administrative work that consumes school staff time: enrolment records, attendance, assessment and results, fee tracking and parent communication.\n\nIt is being designed around constraints that are real in the region: intermittent connectivity, shared devices, low-end Android phones and staff who are not full-time computer users.\n\nStatus: in development. Nothing on this page describes a shipped product, and there are no customers yet.',
    'Education',
    'in_development',
    array[
      'Student and enrolment records',
      'Attendance capture that works on low-end Android devices',
      'Assessment and results processing',
      'Fee tracking and statements',
      'Parent and guardian communication',
      'Role-based access for administrators and teachers'
    ],
    'Ask about Softronics Education',
    '/contact?inquiry=general',
    true,
    true,
    1,
    'Softronics Education: school operations platform (in development)',
    'An early-stage school operations platform from Softronics covering records, attendance, results and fees. Currently in development.'
  ),
  (
    'Softronics Business',
    'softronics-business',
    'Research toward a lightweight operations system for small businesses: inventory, sales, invoicing and simple reporting.',
    E'Softronics Business is currently at the research stage. We are studying how small and mid-sized African businesses actually track stock, record sales and issue invoices today, including the spreadsheet and paper workflows that already work for them.\n\nNo feature set is final. The intent is a system that is faster than a spreadsheet and cheaper than enterprise ERP, that runs well on a phone, and that degrades gracefully when the network does.\n\nStatus: research and early development.',
    'Business',
    'research',
    array[
      'Inventory and stock movement',
      'Sales recording and receipts',
      'Invoicing and payment status',
      'Simple operational reporting',
      'Multi-user access with roles'
    ],
    'Contribute to the research',
    '/contact?inquiry=project',
    false,
    true,
    2,
    'Softronics Business: small business operations research',
    'Softronics Business is early research toward a lightweight operations system for small and mid-sized businesses.'
  )
on conflict (slug) do nothing;

-- --- projects ---------------------------------------------------------------
insert into public.projects (name, slug, summary, description, sector, status, year, is_published, sort_order)
values
  (
    'Softronics website and CMS',
    'softronics-website-cms',
    'This website and the admin system behind it, built in-house as the first Softronics engineering artefact.',
    E'The Softronics website is a Next.js application with a Postgres-backed CMS for products, articles, media and contact messages. It is maintained by the team as internal work rather than a client engagement.\n\nIt exists partly as infrastructure and partly as a reference implementation of how we prefer to build: server rendering by default, a real relational schema, row level security in the database, and no client-side secrets.',
    'Internal',
    'internal',
    2026,
    true,
    1
  )
on conflict (slug) do nothing;

-- --- insights ---------------------------------------------------------------
insert into public.posts
  (title, slug, excerpt, content, author_name, status, published_at, seo_title, seo_description, reading_minutes,
   category_id)
values
  (
    'Practical software, and why the word matters',
    'practical-software-and-why-the-word-matters',
    'Software is only useful when someone can actually use it under real conditions. That constraint shapes everything we build.',
    E'## Starting from the constraint, not the demo\n\nA lot of software is designed for the conditions of its demo: a fast laptop, a stable connection, a trained user with time to explore. Those conditions are not universal. When the same software meets a shared Android phone on an intermittent network, operated by someone with five minutes between other duties, it stops being useful.\n\nWe use the word **practical** deliberately. It means the software has to work in the environment where the problem lives.\n\n## What that changes\n\n- **Data entry beats dashboards.** If capturing a record takes too long, there is no data to visualise.\n- **Offline is a first-class state.** A form that loses work on a dropped connection will be abandoned.\n- **Server rendering is a performance decision.** Shipping less JavaScript is the cheapest way to be fast on a low-end device.\n- **Small screens are the design target.** Most people who will use what we build will use a phone.\n\n## What it does not mean\n\nPractical does not mean primitive. Constraints are not an excuse for weak engineering, poor security or an ugly interface. It means the quality goes into the parts that decide whether the system gets used at all.\n\n## Where we are\n\nSoftronics is early. We are building services work and our first products in parallel, and we would rather describe honestly what exists than advertise what does not. If you have a problem that fits this way of working, [tell us about it](/contact).',
    'Softronics',
    'published',
    now() - interval '3 days',
    'Practical software, and why the word matters | Softronics',
    'Why Softronics designs for real conditions: low-end devices, intermittent networks and users with no time to spare.',
    4,
    (select id from public.categories where kind = 'post' and slug = 'company')
  ),
  (
    'Notes on choosing a stack you can still maintain in two years',
    'choosing-a-maintainable-stack',
    'A working draft on dependency discipline, boring technology and the cost of fashionable choices.',
    E'## Draft\n\nThis article is an unpublished draft. It exists so the CMS draft workflow can be tested: it should be visible in the dashboard and invisible on the public website.\n\n## Outline\n\n1. Every dependency is a maintenance commitment.\n2. Boring technology is a feature when the team is small.\n3. Where abstraction pays for itself, and where it does not.\n4. Migration cost is the real cost of a fashionable choice.',
    'Softronics',
    'draft',
    null,
    null,
    null,
    3,
    (select id from public.categories where kind = 'post' and slug = 'engineering')
  )
on conflict (slug) do nothing;

insert into public.post_tags (post_id, tag_id)
select p.id, t.id
from public.posts p
join public.tags t on t.slug in ('africa', 'practical-software')
where p.slug = 'practical-software-and-why-the-word-matters'
on conflict do nothing;

-- --- site settings (editable website copy) ----------------------------------
insert into public.site_settings (key, value) values
  ('general', jsonb_build_object(
    'company_name', 'Softronics',
    'tagline', 'Building practical software for Africa.',
    'contact_email', 'hello@softronics.example',
    'whatsapp_number', '',
    'location_label', 'Uganda / East Africa'
  )),
  ('home_hero', jsonb_build_object(
    'heading', 'Building practical software for Africa.',
    'description', 'Softronics designs and develops practical digital solutions for businesses, institutions and organizations, with a focus on solving real problems through technology.',
    'primary_cta_label', 'Talk to Softronics',
    'primary_cta_href', '/contact',
    'secondary_cta_label', 'Explore Our Work',
    'secondary_cta_href', '/products'
  )),
  ('home_cta', jsonb_build_object(
    'heading', 'Have a problem technology could solve?',
    'subheading', 'Let''s build something useful.',
    'cta_label', 'Talk to Softronics',
    'cta_href', '/contact'
  )),
  ('about', jsonb_build_object(
    'philosophy_heading', 'Technology should solve real problems.',
    'philosophy_body', 'Softronics exists to build practical, accessible and scalable software, starting from real-world problems and growing toward products that can serve African markets and eventually global users.'
  )),
  ('demo', jsonb_build_object(
    'seeded', true,
    'note', 'Rows created by supabase/seed.sql. Product and article content here is placeholder structure, not verified company information.'
  ))
on conflict (key) do update set value = excluded.value, updated_at = now();
