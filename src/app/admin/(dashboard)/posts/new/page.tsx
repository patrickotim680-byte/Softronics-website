import { PageHeader } from '@/components/admin/page-header';
import { PostForm } from '@/components/admin/post-form';
import { listCategories } from '@/lib/db/taxonomy';
import { listMedia } from '@/lib/db/media';

export const metadata = { title: 'New article' };

export default async function NewPostPage() {
  const [categories, media] = await Promise.all([listCategories('post'), listMedia(60)]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="New article"
        description="Saved as a draft unless you set the status to published."
      />
      <PostForm categories={categories} media={media} />
    </div>
  );
}
