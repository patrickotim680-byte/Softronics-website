import { notFound } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';
import { DeleteAction } from '@/components/admin/row-actions';
import { deleteProjectAction } from '@/lib/actions/projects';
import { getProjectById } from '@/lib/db/projects';
import { listMedia } from '@/lib/db/media';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Edit project' };

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [project, media] = await Promise.all([getProjectById(id), listMedia(60)]);

  if (!project) notFound();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Edit project"
        description={`Last updated ${formatDateTime(project.updated_at)}`}
        actions={
          <DeleteAction
            action={deleteProjectAction}
            id={project.id}
            confirmMessage={`Delete "${project.name}"? This cannot be undone.`}
          />
        }
      />

      {saved && (
        <Alert tone="success">
          <p>Project created. You are now editing it.</p>
        </Alert>
      )}

      <ProjectForm project={project} media={media} />
    </div>
  );
}
