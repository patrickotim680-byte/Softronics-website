import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';
import { listMedia } from '@/lib/db/media';

export const metadata = { title: 'New project' };

export default async function NewProjectPage() {
  const media = await listMedia(60);

  return (
    <div className="space-y-7">
      <PageHeader title="New project" description="Only publish work you are permitted to describe." />
      <ProjectForm media={media} />
    </div>
  );
}
