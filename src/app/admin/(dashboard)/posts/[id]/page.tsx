import { notFound } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/page-header';
import { PostForm } from '@/components/admin/post-form';
import { DeleteAction } from '@/components/admin/row-actions';
import { PostStatusBadge } from '@/components/site/status-badge';
import { deletePostAction } from '@/lib/actions/posts';
import { getPostById } from '@/lib/db/posts';
import { listCategories } from '@/lib/db/taxonomy';
import { listMedia } from '@/lib/db/media';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Edit article' };

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [post, categories, media] = await Promise.all([
    getPostById(id),
    listCategories('post'),
    listMedia(60),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Edit article"
        description={`Last updated ${formatDateTime(post.updated_at)}`}
        actions={
          <>
            <PostStatusBadge status={post.status} />
            <DeleteAction
              action={deletePostAction}
              id={post.id}
              confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
            />
          </>
        }
      />

      {saved && (
        <Alert tone="success">
          <p>Article created. You are now editing it.</p>
        </Alert>
      )}

      <PostForm post={post} categories={categories} media={media} />
    </div>
  );
}
