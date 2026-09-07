import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteAction } from '@/components/admin/row-actions';
import { ProjectStatusBadge } from '@/components/site/status-badge';
import { deleteProjectAction } from '@/lib/actions/projects';
import { listAllProjects } from '@/lib/db/projects';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Projects' };

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const [{ deleted }, projects] = await Promise.all([searchParams, listAllProjects()]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Projects"
        description="Engagements and internal work. Published projects appear in the work list on the public About page."
        actions={
          <ButtonLink href="/admin/projects/new" size="sm">
            New project
          </ButtonLink>
        }
      />

      {deleted && (
        <Alert tone="success">
          <p>Project deleted.</p>
        </Alert>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Add a project once you have permission to describe it publicly, or keep it unpublished as an internal record."
          action={<ButtonLink href="/admin/projects/new" size="sm">New project</ButtonLink>}
        />
      ) : (
        <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-line bg-surface">
          {projects.map((project) => (
            <li key={project.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="font-semibold text-ink hover:text-brand-strong"
                  >
                    {project.name}
                  </Link>
                  <ProjectStatusBadge status={project.status} />
                  {!project.is_published && <Badge tone="amber">Unpublished</Badge>}
                </div>
                {project.summary && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                    {project.summary}
                  </p>
                )}
                <p className="mt-2 font-mono text-[0.6875rem] text-faint">
                  {project.year ? `${project.year} · ` : ''}Updated {formatDateTime(project.updated_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="inline-flex h-9 items-center rounded-md border border-line px-3 text-xs font-medium text-ink hover:bg-raised"
                >
                  Edit
                </Link>
                <DeleteAction
                  action={deleteProjectAction}
                  id={project.id}
                  confirmMessage={`Delete "${project.name}"? This cannot be undone.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
