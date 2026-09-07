import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/page-header';
import { Stat } from '@/components/admin/stat';
import { MessageStatusBadge, PostStatusBadge } from '@/components/site/status-badge';
import { requireAdmin } from '@/lib/auth';
import { countPosts, listAllPosts } from '@/lib/db/posts';
import { countProducts } from '@/lib/db/products';
import { countProjects } from '@/lib/db/projects';
import { countMedia } from '@/lib/db/media';
import { listMessages } from '@/lib/db/messages';
import { formatDateTime } from '@/lib/utils';
import { serverEnv } from '@/lib/env';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const [posts, products, projects, media, messages, recentPosts] = await Promise.all([
    countPosts(),
    countProducts(),
    countProjects(),
    countMedia(),
    listMessages(),
    listAllPosts(),
  ]);

  const unread = messages.filter((message) => message.status === 'unread');
  const emailConfigured = Boolean(serverEnv.email.provider());

  return (
    <div className="space-y-9">
      <PageHeader
        title={`Welcome back, ${session.admin.full_name?.split(' ')[0] ?? 'there'}`}
        description="Everything on the public website is managed from here. Changes appear on the site immediately after saving."
        actions={
          <>
            <ButtonLink href="/admin/posts/new" size="sm">
              New article
            </ButtonLink>
            <ButtonLink href="/admin/products/new" size="sm" variant="secondary">
              New product
            </ButtonLink>
          </>
        }
      />

      <section aria-labelledby="counts">
        <h2 id="counts" className="sr-only">
          Content counts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Stat
            label="Articles"
            value={posts.total}
            detail={`${posts.published} published, ${posts.drafts} draft`}
            href="/admin/posts"
          />
          <Stat
            label="Products"
            value={products.total}
            detail={`${products.published} published`}
            href="/admin/products"
          />
          <Stat
            label="Projects"
            value={projects.total}
            detail={`${projects.published} published`}
            href="/admin/projects"
          />
          <Stat label="Media" value={media} detail="files" href="/admin/media" />
          <Stat
            label="Unread messages"
            value={unread.length}
            detail={`${messages.length} total`}
            href="/admin/messages"
          />
        </div>
      </section>

      {!emailConfigured && (
        <Alert tone="info" title="Email notifications are off">
          <p>
            Contact submissions are stored and listed under Messages, but no notification email is
            sent. Set <code className="font-mono text-[0.8125rem]">EMAIL_PROVIDER</code> and the
            related keys to enable it. See <Link href="/admin/settings">Settings</Link>.
          </p>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="recent-messages">
          <div className="flex items-end justify-between gap-4">
            <h2 id="recent-messages" className="text-lg font-semibold tracking-[-0.018em] text-ink">
              Recent messages
            </h2>
            <Link
              href="/admin/messages"
              className="text-sm font-medium text-brand-strong hover:text-brand"
            >
              All messages
            </Link>
          </div>

          {messages.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-line p-6 text-sm text-muted">
              No contact submissions yet. The form on{' '}
              <Link href="/contact" className="text-brand-strong underline underline-offset-2">
                /contact
              </Link>{' '}
              writes here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-hairline rounded-lg border border-line bg-surface">
              {messages.slice(0, 5).map((message) => (
                <li key={message.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {message.name}
                        {message.organization ? ` · ${message.organization}` : ''}
                      </p>
                      <p className="truncate text-xs text-muted">{message.email}</p>
                    </div>
                    <MessageStatusBadge status={message.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {message.message}
                  </p>
                  <p className="mt-2 font-mono text-[0.6875rem] text-faint">
                    {formatDateTime(message.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-articles">
          <div className="flex items-end justify-between gap-4">
            <h2 id="recent-articles" className="text-lg font-semibold tracking-[-0.018em] text-ink">
              Recently edited articles
            </h2>
            <Link
              href="/admin/posts"
              className="text-sm font-medium text-brand-strong hover:text-brand"
            >
              All articles
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-line p-6 text-sm text-muted">
              No articles yet.{' '}
              <Link href="/admin/posts/new" className="text-brand-strong underline underline-offset-2">
                Write the first one
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-hairline rounded-lg border border-line bg-surface">
              {recentPosts.slice(0, 5).map((post) => (
                <li key={post.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="block truncate text-sm font-medium text-ink hover:text-brand-strong"
                    >
                      {post.title}
                    </Link>
                    <p className="font-mono text-[0.6875rem] text-faint">
                      Updated {formatDateTime(post.updated_at)}
                    </p>
                  </div>
                  <PostStatusBadge status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
