import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteAction, StatusAction } from '@/components/admin/row-actions';
import { PostStatusBadge } from '@/components/site/status-badge';
import { deletePostAction, setPostStatusAction } from '@/lib/actions/posts';
import { listAllPosts } from '@/lib/db/posts';
import { formatDate, formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Insights' };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const [{ deleted }, posts] = await Promise.all([searchParams, listAllPosts()]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Insights"
        description="Articles for the public /insights section. Drafts are never visible on the website."
        actions={
          <ButtonLink href="/admin/posts/new" size="sm">
            New article
          </ButtonLink>
        }
      />

      {deleted && (
        <Alert tone="success">
          <p>Article deleted.</p>
        </Alert>
      )}

      {posts.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Write the first article. It stays a private draft until you publish it."
          action={<ButtonLink href="/admin/posts/new" size="sm">New article</ButtonLink>}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">All articles with status and actions</caption>
            <thead className="border-b border-line bg-raised">
              <tr>
                <th scope="col" className="px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
                  Article
                </th>
                <th scope="col" className="hidden px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint md:table-cell">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint lg:table-cell">
                  Updated
                </th>
                <th scope="col" className="px-4 py-3 text-right font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {posts.map((post) => (
                <tr key={post.id} className="align-top">
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium text-ink hover:text-brand-strong"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 font-mono text-[0.6875rem] text-faint">/insights/{post.slug}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                      <PostStatusBadge status={post.status} />
                      {post.published_at && (
                        <span className="font-mono text-[0.6875rem] text-faint">
                          {formatDate(post.published_at)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 md:table-cell">
                    <PostStatusBadge status={post.status} />
                    {post.published_at && (
                      <p className="mt-1.5 font-mono text-[0.6875rem] text-faint">
                        {formatDate(post.published_at)}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-4 font-mono text-[0.6875rem] text-faint lg:table-cell">
                    {formatDateTime(post.updated_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {post.status === 'published' ? (
                        <>
                          <Link
                            href={`/insights/${post.slug}`}
                            target="_blank"
                            className="text-xs font-medium text-muted underline decoration-line underline-offset-4 hover:text-ink"
                          >
                            View
                          </Link>
                          <StatusAction
                            action={setPostStatusAction}
                            id={post.id}
                            status="draft"
                            label="Unpublish"
                          />
                        </>
                      ) : (
                        <StatusAction
                          action={setPostStatusAction}
                          id={post.id}
                          status="published"
                          label="Publish"
                        />
                      )}
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="inline-flex h-9 items-center rounded-md border border-line px-3 text-xs font-medium text-ink hover:bg-raised"
                      >
                        Edit
                      </Link>
                      <DeleteAction
                        action={deletePostAction}
                        id={post.id}
                        confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
