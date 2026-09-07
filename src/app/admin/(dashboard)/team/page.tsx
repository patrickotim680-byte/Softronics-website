import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/page-header';
import { AllowlistForm } from '@/components/admin/allowlist-form';
import { DeleteAction } from '@/components/admin/row-actions';
import { removeAllowlistEntryAction, setAdminActiveAction } from '@/lib/actions/team';
import { requireOwner } from '@/lib/auth';
import { listAdminUsers, listAllowlist } from '@/lib/db/team';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Team' };

/** Owner-only. requireOwner redirects anyone else to /admin/unauthorized. */
export default async function AdminTeamPage() {
  const session = await requireOwner();
  const [admins, allowlist] = await Promise.all([listAdminUsers(), listAllowlist()]);

  const pending = allowlist.filter(
    (entry) => !admins.some((admin) => admin.email.toLowerCase() === entry.email.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Who can sign in to the Softronics CMS, and at what level."
      />

      <Alert tone="info" title="How access works">
        <p>
          Two things are required: the email must be on the allowlist below,{' '}
          <strong>and</strong> a Supabase Auth account must exist for it. Creating the auth account
          automatically creates the dashboard profile. Deactivating a profile revokes access
          immediately without deleting any history.
        </p>
      </Alert>

      <section aria-labelledby="accounts">
        <h2 id="accounts" className="text-lg font-semibold tracking-[-0.018em] text-ink">
          Active accounts
        </h2>
        <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-lg border border-line bg-surface">
          {admins.map((admin) => (
            <li key={admin.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{admin.full_name ?? admin.email}</p>
                  <Badge tone={admin.role === 'owner' ? 'blue' : 'neutral'}>{admin.role}</Badge>
                  {!admin.is_active && <Badge tone="red">Deactivated</Badge>}
                  {admin.id === session.userId && <Badge tone="green">You</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">{admin.email}</p>
                <p className="mt-1 font-mono text-[0.6875rem] text-faint">
                  {admin.last_seen_at
                    ? `Last signed in ${formatDateTime(admin.last_seen_at)}`
                    : 'Has not signed in yet'}
                </p>
              </div>

              {admin.id !== session.userId && (
                <div className="flex items-center gap-2 sm:justify-end">
                  <form action={setAdminActiveAction}>
                    <input type="hidden" name="id" value={admin.id} />
                    <input type="hidden" name="active" value={admin.is_active ? 'false' : 'true'} />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-md border border-line px-3 text-xs font-medium text-ink hover:bg-raised"
                    >
                      {admin.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
          {admins.length === 0 && (
            <li className="p-5 text-sm text-muted">
              No dashboard profiles exist yet. Create a Supabase Auth user for an allowlisted email
              to generate one.
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="allowlist">
        <h2 id="allowlist" className="text-lg font-semibold tracking-[-0.018em] text-ink">
          Authorized emails
        </h2>
        <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-lg border border-line bg-surface">
          {allowlist.map((entry) => (
            <li key={entry.email} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-ink">{entry.email}</p>
                  <Badge tone={entry.role === 'owner' ? 'blue' : 'neutral'}>{entry.role}</Badge>
                  {pending.some((item) => item.email === entry.email) && (
                    <Badge tone="amber">No auth account yet</Badge>
                  )}
                </div>
                {entry.note && <p className="mt-1 text-sm text-muted">{entry.note}</p>}
              </div>
              <DeleteAction
                action={removeAllowlistEntryAction}
                id={entry.email}
                field="email"
                label="Remove"
                confirmMessage={`Remove ${entry.email} from the allowlist? They will not be able to sign in.`}
              />
            </li>
          ))}
          {allowlist.length === 0 && (
            <li className="p-5 text-sm text-muted">
              The allowlist is empty. Run migration 0003, or add an email below.
            </li>
          )}
        </ul>
      </section>

      <AllowlistForm />

      <p className="text-xs leading-relaxed text-muted">
        Deactivated accounts keep their authorship on existing articles. To remove someone
        permanently, delete their user in Supabase Auth as well.
      </p>

      <noscript>
        <p className="text-xs text-muted">
          Every control on this page is a standard form submission, so it works without JavaScript.
        </p>
      </noscript>
    </div>
  );
}
