'use client';

import { useActionState, useState } from 'react';
import { saveProjectAction } from '@/lib/actions/projects';
import { idleState } from '@/lib/actions/types';
import { PROJECT_STATUS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { ImageField } from './image-field';
import { MarkdownEditor } from './markdown-editor';
import type { MediaItem, Project, ProjectStatus } from '@/types/database';

export function ProjectForm({ project, media }: { project?: Project; media: MediaItem[] }) {
  const [state, formAction] = useActionState(saveProjectAction, idleState);
  const errors = state.errors ?? {};

  const [name, setName] = useState(project?.name ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');

  return (
    <form action={formAction} className="space-y-8">
      {project && <input type="hidden" name="id" value={project.id} />}

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Not saved">
          <p>{state.message}</p>
        </Alert>
      )}
      {state.status === 'success' && state.message && (
        <Alert tone="success">
          <p>{state.message}</p>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="space-y-6">
          <Field label="Name" name="name" required error={errors.name}>
            <input
              {...fieldAria('name', undefined, errors.name)}
              type="text"
              required
              maxLength={160}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            label="Slug"
            name="slug"
            error={errors.slug}
            hint="Used as a stable identifier for the project."
          >
            <input
              {...fieldAria('slug', 'slug', errors.slug)}
              type="text"
              maxLength={80}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              onBlur={(event) => setSlug(slugify(event.target.value))}
              placeholder={slugify(name) || 'auto-generated-from-name'}
              className={controlClass}
            />
          </Field>

          <Field
            label="Summary"
            name="summary"
            error={errors.summary}
            hint="Shown in the work list on the About page."
          >
            <textarea
              {...fieldAria('summary', 'summary', errors.summary)}
              rows={3}
              maxLength={400}
              defaultValue={project?.summary ?? ''}
              className={`${controlClass} resize-y`}
            />
          </Field>

          <MarkdownEditor
            label="Description"
            name="description"
            rows={14}
            defaultValue={project?.description ?? ''}
            error={errors.description}
            hint="Internal detail and context. Markdown."
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Project details
            </h2>

            <Field label="Status" name="status" required error={errors.status}>
              <select
                {...fieldAria('status', undefined, errors.status)}
                defaultValue={project?.status ?? 'in_progress'}
                className={controlClass}
              >
                {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((value) => (
                  <option key={value} value={value}>
                    {PROJECT_STATUS[value].label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sector" name="sector" error={errors.sector}>
              <input
                {...fieldAria('sector', undefined, errors.sector)}
                type="text"
                maxLength={80}
                placeholder="Education, Retail, Internal…"
                defaultValue={project?.sector ?? ''}
                className={controlClass}
              />
            </Field>

            <Field label="Year" name="year" error={errors.year}>
              <input
                {...fieldAria('year', undefined, errors.year)}
                type="number"
                min={2000}
                max={2100}
                defaultValue={project?.year ?? new Date().getFullYear()}
                className={controlClass}
              />
            </Field>

            <Field label="Sort order" name="sort_order" error={errors.sort_order}>
              <input
                {...fieldAria('sort_order', undefined, errors.sort_order)}
                type="number"
                min={0}
                max={9999}
                defaultValue={project?.sort_order ?? 0}
                className={controlClass}
              />
            </Field>

            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={project?.is_published ?? false}
                className="mt-0.5 h-4 w-4 rounded border-line accent-brand focus:ring-2 focus:ring-brand/30"
              />
              <span>
                Published
                <span className="block text-xs text-muted">
                  Appears in the work list on the public About page.
                </span>
              </span>
            </label>

            <ImageField
              label="Image"
              name="image_url"
              defaultValue={project?.image_url}
              media={media}
              error={errors.image_url}
            />

            <SubmitButton label="Save project" pendingLabel="Saving…" className="w-full" />
          </div>
        </aside>
      </div>
    </form>
  );
}
