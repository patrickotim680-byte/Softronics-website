# Softronics

**Building practical software for Africa.**

This repository contains the Softronics public website and the authenticated
admin/CMS dashboard, in a single Next.js application.

- Public site: `/`
- Admin dashboard: `/admin` (sign in at `/admin/login`)

---

## Table of contents

1. [What Softronics is](#1-what-softronics-is)
2. [Project architecture](#2-project-architecture)
3. [Technology stack](#3-technology-stack)
4. [Install dependencies](#4-install-dependencies)
5. [Run locally](#5-run-locally)
6. [Environment variables](#6-environment-variables)
7. [Create and connect Supabase](#7-create-and-connect-supabase)
8. [Authentication](#8-authentication)
9. [Create the database schema](#9-create-the-database-schema)
10. [Seed demo data](#10-seed-demo-data)
11. [Create administrator accounts](#11-create-administrator-accounts)
12. [Deploy to Vercel](#12-deploy-to-vercel)
13. [Connect a custom domain](#13-connect-a-custom-domain)
14. [Configure email](#14-configure-email)
15. [How the CMS works](#15-how-the-cms-works)
16. [Add, edit and delete products](#16-add-edit-and-delete-products)
17. [Publish articles](#17-publish-articles)
18. [Media storage](#18-media-storage)
19. [Security considerations](#19-security-considerations)
20. [Known limitations](#20-known-limitations)
21. [Future extension points](#21-future-extension-points)
22. [Architectural decisions](#22-architectural-decisions)
23. [Verification checklist](#23-verification-checklist)

---

## 1. What Softronics is

Softronics is a technology company focused on building practical software
solutions for Africa. It designs and develops digital solutions for businesses,
institutions and organizations, starting from real problems rather than from
technology.

The long-term direction is **services → software products → platforms →
technology infrastructure**. This website establishes the company professionally
while leaving structural room for products and platforms that do not exist yet.

**Honesty rules baked into this codebase.** The site never claims customers,
partnerships, awards, offices, staff numbers or achievements that have not been
provided. Products carry explicit statuses: `Concept`, `Research`,
`In development`, `Coming soon`, `Available`, `Archived`. Placeholder content in
the seed file is labelled as such and is safe to delete.

---

## 2. Project architecture

```
softronics/
├── src/
│   ├── app/
│   │   ├── (public)/                 public website, shares header/footer
│   │   │   ├── page.tsx              /
│   │   │   ├── solutions/            /solutions
│   │   │   ├── products/             /products and /products/[slug]
│   │   │   ├── about/                /about
│   │   │   ├── insights/             /insights and /insights/[slug]
│   │   │   ├── contact/              /contact
│   │   │   ├── privacy/, terms/      /privacy, /terms
│   │   │   ├── layout.tsx            header, footer, organisation JSON-LD
│   │   │   └── loading.tsx           streaming skeleton
│   │   ├── admin/
│   │   │   ├── (auth)/login/         /admin/login  (no dashboard chrome)
│   │   │   └── (dashboard)/          everything behind requireAdmin()
│   │   │       ├── layout.tsx        auth guard + sidebar + topbar
│   │   │       ├── page.tsx          /admin overview
│   │   │       ├── posts/            list, new, [id] edit
│   │   │       ├── products/        list, new, [id] edit
│   │   │       ├── projects/         list, new, [id] edit
│   │   │       ├── media/            upload + library
│   │   │       ├── messages/         contact submissions
│   │   │       ├── content/          editable site copy
│   │   │       ├── team/             admin allowlist (owner only)
│   │   │       ├── settings/         configuration diagnostics
│   │   │       ├── unauthorized/     403 state
│   │   │       ├── loading.tsx, error.tsx
│   │   ├── layout.tsx                fonts, global metadata
│   │   ├── globals.css               design tokens (OKLCH) + Tailwind layers
│   │   ├── sitemap.ts, robots.ts, manifest.ts
│   │   ├── not-found.tsx, error.tsx
│   ├── components/
│   │   ├── ui/                       button, badge, field, alert, markdown…
│   │   ├── site/                     header, footer, product rows, contact form
│   │   └── admin/                    sidebar, editors, uploader, row actions
│   ├── lib/
│   │   ├── actions/                  Server Actions (all writes)
│   │   ├── db/                       read queries, one module per entity
│   │   ├── supabase/                 browser / server / service / middleware clients
│   │   ├── validation/schemas.ts     Zod schemas for every input
│   │   ├── auth.ts                   getAdminSession, requireAdmin, requireOwner
│   │   ├── storage.ts                storage provider abstraction
│   │   ├── email.ts                  notification provider (optional)
│   │   ├── rate-limit.ts             contact-form throttling
│   │   ├── seo.ts, constants.ts, env.ts, utils.ts
│   ├── types/database.ts             row types mirroring the SQL schema
│   └── middleware.ts                 session refresh + /admin gate
├── supabase/
│   ├── migrations/0001_init.sql       tables, indexes, triggers
│   ├── migrations/0002_rls.sql        row level security + storage policies
│   ├── migrations/0003_admin_allowlist.sql  authorized admin emails
│   └── seed.sql                       optional demo/dev content
├── scripts/
│   ├── check-env.mjs                 npm run env:check
│   └── create-admin.mjs              npm run admin:create
├── public/brand/                     the official Softronics logo and icons
├── public/og/og-default.png          social share image
└── .env.example
```

**Layering.** UI components never talk to the database. Pages call `lib/db/*`
for reads; forms call `lib/actions/*` for writes. Every action validates with
Zod, re-checks authorisation, and then writes through a Supabase client whose
permissions are enforced by Row Level Security.

**Three Supabase clients, three purposes.**

| Client | File | Used for | Key |
| --- | --- | --- | --- |
| Public | `getPublicSupabase()` | published content on public pages (cookie-free, so pages stay statically renderable) | anon |
| Server (session) | `getServerSupabase()` | admin reads/writes as the signed-in user | anon + session cookie |
| Service | `getServiceSupabase()` | contact-form inserts and CLI scripts only | service role, server only |

---

## 3. Technology stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | TypeScript, strict mode |
| UI | React 19, Tailwind CSS 3 |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (email + password), cookie sessions via `@supabase/ssr` |
| Storage | Supabase Storage, behind a provider interface |
| Validation | Zod |
| Content format | Markdown, rendered with `react-markdown` + `remark-gfm` |
| Email | Resend over `fetch` (optional, disabled by default) |
| Hosting | Vercel-compatible |

No component library, no ORM, no state-management library. Fewer dependencies is
a maintenance decision.

---

## 4. Install dependencies

Requires **Node.js 20.9 or newer**.

```bash
npm install
```

---

## 5. Run locally

```bash
cp .env.example .env.local     # then fill in the Supabase values
npm run env:check              # confirms what is set, prints no secrets
npm run dev                    # http://localhost:3000
```

The app starts even with no database configured: public pages render with empty
states, and `/admin/login` shows exactly which variables are missing. Nothing is
faked to hide the gap.

Other scripts:

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
```

---

## 6. Environment variables

Copy `.env.example` to `.env.local`. `.env.local` is git-ignored and must never
be committed.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL for metadata, sitemap, OG tags |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public key, safe to expose, constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Server only.** Contact-form inserts and provisioning |
| `SUPABASE_STORAGE_BUCKET` | no | Defaults to `media` |
| `DATABASE_URL` | no | Only for `psql` or migration tooling |
| `AUTH_SECRET` | no | Reserved for future auth adapters. `openssl rand -base64 32` |
| `ADMIN_ALLOWED_EMAILS` | no | Second gate on top of the database allowlist |
| `NEXT_PUBLIC_CONTACT_EMAIL` | no | Contact address shown publicly |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | Empty hides the WhatsApp link |
| `EMAIL_PROVIDER` | no | `resend`, or empty to disable notification email |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` | no | Required when `EMAIL_PROVIDER=resend` |

Only `NEXT_PUBLIC_*` variables reach the browser. `getServiceRoleKey()` throws if
it is ever called in client code.

---

## 7. Create and connect Supabase

1. Create a project at [supabase.com](https://supabase.com). Pick the region
   closest to your users.
2. **Project Settings → API**: copy the Project URL, the `anon` public key and
   the `service_role` secret key.
3. Put them in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

4. Run the migrations (next section), then restart `npm run dev`.

---

## 8. Authentication

Supabase Auth handles credentials. This application never sees, stores or
transmits a password.

Access requires **both** of:

1. a Supabase Auth user, and
2. an active row in `public.admin_users`.

`public.admin_allowlist` decides which emails are permitted to hold an admin
account. Migration `0003` seeds the two initial administrator addresses:

```
otimg197@gmail.com   (owner)
odan8897@gmail.com   (owner)
```

A database trigger on `auth.users` creates the `admin_users` profile
automatically when an allowlisted email signs up, so provisioning is: create the
auth user, done. Optionally set `ADMIN_ALLOWED_EMAILS` for an extra
application-level check.

Enforcement layers, in order:

1. `src/middleware.ts` redirects unauthenticated `/admin/*` requests to the login page.
2. `requireAdmin()` in the dashboard layout re-verifies the session against the database on every render.
3. Every Server Action calls `requireAdmin()` (or `requireOwner()`) again before writing.
4. Row Level Security rejects unauthorised writes even if all of the above were bypassed.

Roles: `owner` (everything, including team management), `admin` and `editor`
(all content). Team management is owner-only; others are redirected to
`/admin/unauthorized`.

**Password resets** are done from the Supabase dashboard
(Authentication → Users → Send recovery), or by another owner.

---

## 9. Create the database schema

Run the three migrations in order. Easiest route, the SQL editor:

1. Supabase dashboard → **SQL Editor** → New query.
2. Paste and run `supabase/migrations/0001_init.sql`.
3. Paste and run `supabase/migrations/0002_rls.sql`.
4. Paste and run `supabase/migrations/0003_admin_allowlist.sql`.

With the Supabase CLI instead:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or with `psql` and `DATABASE_URL`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_rls.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_admin_allowlist.sql
```

Tables created: `admin_users`, `admin_allowlist`, `categories`, `tags`, `media`,
`posts`, `post_tags`, `products`, `projects`, `contact_messages`,
`site_settings`. Migration `0002` also creates the public `media` storage bucket
and its policies.

Migrations are idempotent (`if not exists`, `on conflict`, `drop policy if
exists`), so re-running them is safe.

---

## 10. Seed demo data

Optional. Run `supabase/seed.sql` in the SQL editor to get taxonomies, two
placeholder products with honest statuses, one published and one draft article,
one internal project, and the default site copy.

Everything it creates is tagged in `site_settings` under the `demo` key. There
are no fake testimonials, customers, partners or metrics: only structure and
real positioning copy. Delete the seeded rows from `/admin` whenever you like.

---

## 11. Create administrator accounts

**Option A: the script (recommended)**

```bash
npm run admin:create -- otimg197@gmail.com --role owner
```

It adds the email to the allowlist, creates the Supabase Auth user, ensures the
`admin_users` profile exists, and prints a generated strong password **once**.
Change it after the first sign-in. To choose the password yourself:

```bash
printf 'your-strong-password' | npm run admin:create -- odan8897@gmail.com --password-stdin
```

**Option B: the Supabase dashboard**

Authentication → Users → Add user, with an allowlisted email. The trigger creates
the profile.

Then sign in at `/admin/login`.

To authorize more people later: `/admin/team` (owner only) adds the email to the
allowlist; they still need a Supabase Auth account. Deactivating a profile
revokes access immediately while preserving article authorship.

---

## 12. Deploy to Vercel

1. Push the repository to GitHub.
2. Vercel → **Add New Project** → import the repository. Framework detection is
   automatic; no build-command changes needed.
3. **Settings → Environment Variables**: add every variable from `.env.local`
   for Production (and Preview if you want a working preview). Set
   `NEXT_PUBLIC_SITE_URL` to the real deployment URL.
4. Deploy.
5. After the first deploy, confirm `/robots.txt` and `/sitemap.xml` resolve, and
   that `/admin/login` works.

The service role key must only ever be set in Vercel's encrypted environment
variables, never in the repository.

---

## 13. Connect a custom domain

1. Vercel → Project → **Settings → Domains** → add `softronics.example` (and
   `www` if wanted).
2. At your DNS provider, add the records Vercel shows: an `A` record for the
   apex domain, and a `CNAME` for `www` pointing at `cname.vercel-dns.com`.
3. Wait for propagation. TLS certificates are issued automatically.
4. Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy, so canonical
   URLs, OG tags and the sitemap use it.
5. Add the property in Google Search Console and submit
   `https://your-domain/sitemap.xml`. (Indexing and ranking are Google's
   decision; nothing here promises either.)

---

## 14. Configure email

Notifications are off by default. Contact submissions are always stored in the
database and visible at `/admin/messages`, so nothing is lost while email is
unconfigured.

To enable, using [Resend](https://resend.com):

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=Softronics <notifications@your-verified-domain>
EMAIL_TO=team@your-domain
```

`EMAIL_FROM` must be on a domain you have verified with the provider. Adding a
different provider means one new branch in `src/lib/email.ts`.

---

## 15. How the CMS works

Sign in at `/admin/login`. The dashboard has: Dashboard, Insights, Products,
Projects, Media, Messages, Site content, Team (owners), Settings.

Every module is backed by real database tables and real Server Actions. There
are no decorative pages and no buttons that do nothing.

- **Reads** go through `src/lib/db/*` and are filtered by RLS.
- **Writes** go through Server Actions in `src/lib/actions/*`, which validate
  with Zod, check authorisation, then call `revalidatePath()` so the public site
  reflects the change on the next request.
- **Site content** (`/admin/content`) edits fixed website copy stored in
  `site_settings`. Clearing a field restores the built-in default rather than
  blanking the site.
- **Settings** (`/admin/settings`) reports which environment variables are
  present. It prints whether a value exists, never the value.

---

## 16. Add, edit and delete products

1. `/admin/products` → **New product**.
2. Fill in name (slug is generated), short description, full description
   (Markdown), features (one per line), category, status, logo and cover image,
   website URL, CTA label and link.
3. Tick **Published** to make it public. **Featured** prioritises it in the
   homepage section. **Sort order**: lower numbers first.
4. Save. The public `/products` page and `/products/[slug]` update immediately.

Statuses map to the labels shown publicly: `concept` → Concept, `research` →
Research, `in_development` → In development, `coming_soon` → Coming soon,
`available` → Available, `archived` → Archived.

Publish/unpublish inline from the list. Delete asks for confirmation and cannot
be undone.

**Products are never hard-coded.** The homepage and products page read from the
database; with no published products they show a real empty state.

---

## 17. Publish articles

1. `/admin/posts` → **New article**.
2. Enter the title (slug is generated), an excerpt, and the body in Markdown.
   The editor has a live **Preview** tab that renders with the same component
   the public article page uses.
3. Optionally set category, tags (comma separated, created on the fly), featured
   image, SEO title and SEO description.
4. Status `draft` keeps it private. Status `published` makes it public; leave the
   publication date empty to publish now, or set a future date to schedule it.
5. Save. It appears at `/insights` and `/insights/[slug]`.

Drafts are invisible to the public twice over: the query filters them, and the
RLS policy only exposes rows where `status = 'published'` and `published_at <=
now()`. Unpublish by switching the status back to draft.

Articles get canonical URLs, Open Graph and Twitter metadata, and Article
JSON-LD automatically.

---

## 18. Media storage

`/admin/media` uploads to Supabase Storage (public `media` bucket) and records
metadata in the `media` table: filename, MIME type, size, alt text, uploader and
timestamps. Uploaded files are served from the bucket's public URL.

Limits enforced **on the server**: 5 MB, and only `png`, `jpeg`, `webp`, `avif`,
`gif`, `svg`. Filenames are sanitised and prefixed with a UUID, so a malicious
filename cannot traverse paths or overwrite another object.

Binary files never enter the repository, and nothing is written to the local
filesystem: Vercel's runtime filesystem is ephemeral. `public/uploads/` is
git-ignored as a guard rail.

`src/lib/storage.ts` defines a `StorageProvider` interface with a Supabase
implementation. Swapping in S3, R2 or Cloudinary later means adding one file, not
touching the UI.

---

## 19. Security considerations

- **Authentication**: Supabase Auth. No passwords, hashes or secrets in this repository.
- **Authorization**: allowlist + `admin_users` + roles, checked in middleware, in layouts, and again in every action.
- **Row Level Security** on all eleven tables. Anon keys can only read published posts, published products and projects, taxonomies and site settings.
- **`contact_messages` has no anon policy at all.** Submissions are inserted server-side with the service role after validation, so the public API cannot be used as a spam endpoint.
- **Input validation** with Zod on the server for every form. Browser validation is a convenience only.
- **No raw SQL from user input**: all queries go through the Supabase client, which parameterises.
- **Markdown, not HTML.** `react-markdown` builds a React tree and `rehype-raw` is deliberately not enabled, so authored content cannot inject scripts.
- **Contact form defences**: honeypot field, per-IP rate limit (5 per 10 minutes), length caps. Only a truncated SHA-256 hash of the IP is stored, never the address.
- **Uploads**: server-side MIME and size checks, sanitised filenames, admin-only storage write policies.
- **Secrets**: `.env*` is git-ignored except `.env.example`. `getServiceRoleKey()` throws if called in the browser.
- **Headers**: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` set in `next.config.mjs`.
- **Error handling**: users see plain explanations; stack traces and database messages go to the server log.
- **Privilege escalation**: the self-update RLS policy prevents an admin from changing their own role, and an owner cannot deactivate their own account.
- **`/admin` is excluded from `robots.txt`** and marked `noindex`.

Before going live: rotate any key that has ever been pasted into a chat or a
commit, and confirm Supabase Authentication → Providers has email signups
restricted or the allowlist trigger in place.

---

## 20. Known limitations

Honest list of what this first version does **not** do.

1. **Rate limiting is in-process.** `src/lib/rate-limit.ts` keeps counters in memory, so each serverless instance counts separately. Fine against naive spam; use Upstash Redis or Vercel KV for anything stronger.
2. **No draft preview at a public URL.** Drafts are previewed inside the editor. A signed preview route is an obvious next addition.
3. **The editor is Markdown, not WYSIWYG.** Deliberate: portable, diff-friendly, safe to render.
4. **No image transformation pipeline.** Images are served at upload size. `next/image` uses `unoptimized` for remote CMS URLs to avoid coupling the build to a fixed host list; wire up Supabase image transforms or a loader when you need it.
5. **No pagination on Insights.** Fine for tens of articles, not hundreds.
6. **No automated tests.** No test runner is configured yet; Vitest plus Playwright would be the natural pair.
7. **Team page manages the allowlist, not Supabase Auth users.** Creating and deleting auth users happens in Supabase or via the script, so the browser never handles credentials.
8. **Categories and tags have no dedicated admin screen.** Tags are created inline from the article editor; categories are seeded in SQL.
9. **Single language, English only.** No i18n routing.
10. **Database types are hand-written** in `src/types/database.ts`. Replace with `supabase gen types typescript` output when convenient.
11. **The build has not been run in this environment.** The project was authored without network access, so `npm install`, `npm run typecheck` and `npm run build` have not been executed against real dependency versions. Run all three first; see [Verification checklist](#23-verification-checklist).

---

## 21. Future extension points

Structure that is already in place for later work, without over-building now.

- **Users and roles**: `admin_users.role` plus `is_admin()` / `is_owner()` in SQL. Add a role, add a policy.
- **Organizations / multi-tenancy**: add an `organizations` table and an `organization_id` on the content tables, then extend the RLS predicates. The data layer is already one module per entity.
- **Notifications**: `src/lib/email.ts` is a provider interface; add SMS or in-app notifications alongside it.
- **AI services**: keep provider calls in `src/lib/` server modules so keys stay server-side, and expose them through Server Actions.
- **Payments**: a `payments`/`subscriptions` table plus a webhook route handler under `src/app/api/`. No client-side secret handling required.
- **Analytics**: add a script in the root layout, or Vercel Analytics.
- **Public API**: add route handlers under `src/app/api/` that reuse `src/lib/db/*`; the read layer is already independent of the UI.
- **Storage provider swap**: implement `StorageProvider` in a new file and return it from `getStorageProvider()`.

---

## 22. Architectural decisions

Decisions taken where the brief left room, and why.

1. **One Next.js app for site plus CMS.** Shared types, one deploy, one auth story. Route groups keep the two areas visually and structurally separate.
2. **Supabase for database, auth and storage.** One managed dependency instead of three, and RLS gives defence in depth that application-only auth cannot.
3. **Server Actions instead of REST endpoints.** Writes stay colocated and typed, and forms work before hydration. A public API can be added later without moving the logic.
4. **Cookie-free anon client for public pages.** Reading published content without touching cookies keeps public routes statically renderable with ISR. This is the single biggest performance decision in the project.
5. **Text columns with CHECK constraints instead of Postgres enums.** Adding a status later is a one-line migration.
6. **`site_settings` as key/JSONB.** Editable copy without a migration per field, while the application still merges over typed defaults so the site cannot render blank.
7. **Markdown storage.** Safe to render, portable, reviewable.
8. **Products and projects are separate tables.** A product is a Softronics asset; a project is an engagement. Merging them would force nullable columns and confusing statuses.
9. **Hand-written database types.** Keeps the repository free of generated code until a Supabase project exists.
10. **Contact inserts use the service role.** Lets `contact_messages` stay fully closed to anon keys.
11. **Tailwind 3 with tokens in CSS variables.** Colour is declared once in OKLCH in `globals.css` and consumed by name.
12. **No component library.** Fewer dependencies, and the visual identity is built around the actual logo rather than inherited from a template.

---

## 23. Verification checklist

Run this once dependencies are installed. It is the sequence to work through
before calling the deployment live.

**Engineering**

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

**Public website**

- [ ] Every nav link resolves: `/`, `/solutions`, `/products`, `/about`, `/insights`, `/contact`, `/privacy`, `/terms`
- [ ] Logo renders in the header, hero and footer
- [ ] Layout works at 360 px, 768 px, 1280 px and 1920 px
- [ ] Contact form rejects a bad email and a short message, then succeeds with valid input
- [ ] `view-source` shows `<title>`, meta description, canonical and OG tags
- [ ] `/sitemap.xml` and `/robots.txt` resolve, and robots disallows `/admin`
- [ ] A deliberately wrong URL renders the 404 page

**Admin**

- [ ] `/admin` while signed out redirects to `/admin/login`
- [ ] Sign in with an allowlisted account succeeds; a non-allowlisted one does not
- [ ] Create an article, save as draft: it does **not** appear at `/insights`
- [ ] Publish it: it appears at `/insights` and `/insights/[slug]`
- [ ] Edit, unpublish, then delete it
- [ ] Create a product, publish it: it appears on `/products` and the homepage
- [ ] Submit the contact form, then find it under `/admin/messages` and mark it read
- [ ] Upload an image in `/admin/media`, select it as a featured image, confirm it renders
- [ ] Sign out, then confirm `/admin/posts` is inaccessible

**Production**

- [ ] All environment variables set in Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` matches the real domain
- [ ] No secrets in git history (`git log -p -- .env*` returns nothing)
- [ ] `/admin/settings` reports every variable as set

---

Built for Softronics. Practical software, honestly described.
