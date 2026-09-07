import { EmptyState } from '@/components/ui/empty-state';
import { SubmitButton } from '@/components/ui/submit-button';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteAction, StatusAction } from '@/components/admin/row-actions';
import { MessageStatusBadge } from '@/components/site/status-badge';
import {
  deleteMessageAction,
  markAllMessagesReadAction,
  setMessageStatusAction,
} from '@/lib/actions/messages';
import { listMessages } from '@/lib/db/messages';
import { INQUIRY_TYPES } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Messages' };

export default async function AdminMessagesPage() {
  const messages = await listMessages();
  const unread = messages.filter((message) => message.status === 'unread');

  return (
    <div className="space-y-7">
      <PageHeader
        title="Messages"
        description="Submissions from the public contact form. Stored in the database whether or not email notifications are configured."
        actions={
          unread.length > 0 ? (
            <form action={markAllMessagesReadAction}>
              <SubmitButton
                label={`Mark ${unread.length} as read`}
                pendingLabel="Updating…"
                variant="secondary"
                size="sm"
              />
            </form>
          ) : undefined
        }
      />

      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="When someone submits the contact form, their message appears here with the details they provided."
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => {
            const label =
              INQUIRY_TYPES.find((entry) => entry.value === message.inquiry_type)?.label ??
              message.inquiry_type;

            return (
              <li
                key={message.id}
                className={
                  message.status === 'unread'
                    ? 'rounded-lg border border-brand/30 bg-brand/[0.03] p-5'
                    : 'rounded-lg border border-line bg-surface p-5'
                }
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-semibold text-ink">{message.name}</h2>
                      <MessageStatusBadge status={message.status} />
                      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
                        {label}
                      </span>
                    </div>

                    <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                      {message.organization && (
                        <div className="flex gap-1.5">
                          <dt className="text-faint">Organization</dt>
                          <dd className="text-ink/80">{message.organization}</dd>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <dt className="text-faint">Email</dt>
                        <dd>
                          <a
                            href={`mailto:${message.email}`}
                            className="text-brand-strong underline decoration-brand/30 underline-offset-2"
                          >
                            {message.email}
                          </a>
                        </dd>
                      </div>
                      {message.phone && (
                        <div className="flex gap-1.5">
                          <dt className="text-faint">Phone</dt>
                          <dd className="text-ink/80">{message.phone}</dd>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <dt className="text-faint">Received</dt>
                        <dd className="font-mono text-ink/80">
                          {formatDateTime(message.created_at)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {message.status === 'unread' ? (
                      <StatusAction
                        action={setMessageStatusAction}
                        id={message.id}
                        status="read"
                        label="Mark read"
                      />
                    ) : (
                      <StatusAction
                        action={setMessageStatusAction}
                        id={message.id}
                        status="unread"
                        label="Mark unread"
                      />
                    )}
                    {message.status !== 'archived' && (
                      <StatusAction
                        action={setMessageStatusAction}
                        id={message.id}
                        status="archived"
                        label="Archive"
                      />
                    )}
                    <DeleteAction
                      action={deleteMessageAction}
                      id={message.id}
                      confirmMessage={`Delete the message from ${message.name}? This cannot be undone.`}
                    />
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm leading-relaxed text-ink/85">
                  {message.message}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
