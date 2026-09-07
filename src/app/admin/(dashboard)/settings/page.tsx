import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/auth';
import { getServiceRoleKey, publicEnv, serverEnv } from '@/lib/env';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Settings' };

/**
 * Configuration diagnostics.
 *
 * Only whether a value is present is reported, never the value itself. This page
 * exists so an administrator can tell what is connected without opening a shell.
 */
export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  const checks: { label: string; ok: boolean; detail: string }[] = [
    {
      label: 'NEXT_PUBLIC_SITE_URL',
      ok: publicEnv.siteUrl !== 'http://localhost:3000',
      detail: publicEnv.siteUrl,
    },
    {
      label: 'NEXT_PUBLIC_SUPABASE_URL',
      ok: Boolean(publicEnv.supabaseUrl),
      detail: publicEnv.supabaseUrl ? 'Set' : 'Missing: the CMS cannot read or write',
    },
    {
      label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ok: Boolean(publicEnv.supabaseAnonKey),
      detail: publicEnv.supabaseAnonKey ? 'Set' : 'Missing',
    },
    {
      label: 'SUPABASE_SERVICE_ROLE_KEY',
      ok: Boolean(getServiceRoleKey()),
      detail: getServiceRoleKey()
        ? 'Set (server only)'
        : 'Missing: the public contact form cannot store submissions',
    },
    {
      label: 'SUPABASE_STORAGE_BUCKET',
      ok: true,
      detail: serverEnv.storageBucket,
    },
    {
      label: 'AUTH_SECRET',
      ok: Boolean(serverEnv.authSecret()),
      detail: serverEnv.authSecret() ? 'Set' : 'Not required for Supabase Auth, reserved',
    },
    {
      label: 'ADMIN_ALLOWED_EMAILS',
      ok: serverEnv.adminAllowedEmails().length > 0,
      detail:
        serverEnv.adminAllowedEmails().length > 0
          ? `${serverEnv.adminAllowedEmails().length} address(es) allowed`
          : 'Not set: access is controlled by the database allowlist only',
    },
    {
      label: 'EMAIL_PROVIDER',
      ok: Boolean(serverEnv.email.provider()),
      detail: serverEnv.email.provider()
        ? `${serverEnv.email.provider()} configured`
        : 'Off: contact submissions are stored but not emailed',
    },
    {
      label: 'EMAIL_TO',
      ok: Boolean(serverEnv.email.to()),
      detail: serverEnv.email.to() ? 'Set' : 'Not set',
    },
  ];

  const problems = checks.filter((check) => !check.ok);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Environment and account status. Values are never displayed, only whether they are present."
      />

      {problems.length > 0 ? (
        <Alert tone="warning" title={`${problems.length} item(s) not configured`}>
          <p>
            The application still runs, but the features listed below are inactive until the
            variables are set in <code className="font-mono text-[0.8125rem]">.env.local</code> (or
            in your Vercel project settings for production).
          </p>
        </Alert>
      ) : (
        <Alert tone="success" title="Fully configured">
          <p>Every expected environment variable is present.</p>
        </Alert>
      )}

      <section aria-labelledby="env">
        <h2 id="env" className="text-lg font-semibold tracking-[-0.018em] text-ink">
          Environment
        </h2>
        <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-lg border border-line bg-surface">
          {checks.map((check) => (
            <li key={check.label} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs text-ink">{check.label}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted">{check.detail}</span>
                <Badge tone={check.ok ? 'green' : 'amber'}>{check.ok ? 'ok' : 'unset'}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="account">
        <h2 id="account" className="text-lg font-semibold tracking-[-0.018em] text-ink">
          Your account
        </h2>
        <dl className="mt-4 grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">
              Email
            </dt>
            <dd className="mt-1 text-sm text-ink">{session.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">
              Role
            </dt>
            <dd className="mt-1 text-sm text-ink">{session.admin.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">
              Last seen
            </dt>
            <dd className="mt-1 text-sm text-ink">
              {formatDateTime(session.admin.last_seen_at) || 'This session'}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-faint">
              Password
            </dt>
            <dd className="mt-1 text-sm text-muted">
              Managed by Supabase Auth. Change it from the Supabase dashboard.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="ops">
        <h2 id="ops" className="text-lg font-semibold tracking-[-0.018em] text-ink">
          Operations
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>
            Website:{' '}
            <Link
              href="/"
              target="_blank"
              className="text-brand-strong underline decoration-brand/30 underline-offset-4"
            >
              open the public site
            </Link>
          </li>
          <li>
            Sitemap:{' '}
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="text-brand-strong underline decoration-brand/30 underline-offset-4"
            >
              /sitemap.xml
            </Link>{' '}
            regenerates from published content
          </li>
          <li>
            Robots:{' '}
            <Link
              href="/robots.txt"
              target="_blank"
              className="text-brand-strong underline decoration-brand/30 underline-offset-4"
            >
              /robots.txt
            </Link>{' '}
            excludes the admin area
          </li>
        </ul>
      </section>
    </div>
  );
}
