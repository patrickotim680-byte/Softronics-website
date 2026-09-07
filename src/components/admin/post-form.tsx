'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { savePostAction } from '@/lib/actions/posts';
import { idleState } from '@/lib/actions/types';
import { slugify, toDateTimeLocalValue } from '@/lib/utils';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { ImageField } from './image-field';
import { MarkdownEditor } from './markdown-editor';
import type { Category, MediaItem, PostWithRelations } from '@/types/database';

interface PostFormProps {
  post?: PostWithRelations;
  categories: Category[];
  media: MediaItem[];
}

export function PostForm({ post, categories, media }: PostFormProps) {
  const [state, formAction] = useActionState(savePostAction, idleState);
  const errors = state.errors ?? {};

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [status, setStatus] = useState(post?.status ?? 'draft');

  const effectiveSlug = slug.length > 0 ? slug : slugify(title);

  return (
    <form action={formAction} className="space-y-8">
      {post && <input type="hidden" name="id" value={post.id} />}

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Not saved">
          <p>{state.message}</p>
        </Alert>
      )}
      {state.status === 'success' && state.message && (
        <Alert tone="success">
          <p>
            {state.message}{' '}
            {post?.status === 'published' && (
              <Link href={`/insights/${post.slug}`} target="_blank">
                View live article
              </Link>
            )}
          </p>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="space-y-6">
          <Field label="Title" name="title" required error={errors.title}>
            <input
              {...fieldAria('title', undefined, errors.title)}
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            label="Slug"
            name="slug"
            error={errors.slug}
            hint={`Public URL: /insights/${effectiveSlug || 'your-article'}`}
          >
            <input
              {...fieldAria('slug', 'slug', errors.slug)}
              type="text"
              maxLength={80}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              onBlur={(event) => setSlug(slugify(event.target.value))}
              placeholder={slugify(title) || 'auto-generated-from-title'}
              className={controlClass}
            />
          </Field>

          <Field
            label="Excerpt"
            name="excerpt"
            error={errors.excerpt}
            hint="One or two sentences. Used on the Insights index and as a fallback meta description."
          >
            <textarea
              {...fieldAria('excerpt', 'excerpt', errors.excerpt)}
              rows={3}
              maxLength={400}
              defaultValue={post?.excerpt ?? ''}
              className={`${controlClass} resize-y`}
            />
          </Field>

          <MarkdownEditor
            label="Content"
            name="content"
            defaultValue={post?.content ?? ''}
            error={errors.content}
            hint="Markdown. Headings, lists, links, quotes, tables and code blocks are supported."
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Publishing
            </h2>

            <Field label="Status" name="status" required error={errors.status}>
              <select
                {...fieldAria('status', undefined, errors.status)}
                value={status}
                onChange={(event) => setStatus(event.target.value as typeof status)}
                className={controlClass}
              >
                <option value="draft">Draft (private)</option>
                <option value="published">Published (public)</option>
                <option value="archived">Archived (hidden)</option>
              </select>
            </Field>

            <Field
              label="Publication date"
              name="published_at"
              error={errors.published_at}
              hint={
                status === 'published'
                  ? 'Leave empty to publish now. A future date keeps it hidden until then.'
                  : 'Only applies once the article is published.'
              }
            >
              <input
                {...fieldAria('published_at', 'published_at', errors.published_at)}
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(post?.published_at)}
                className={controlClass}
              />
            </Field>

            <SubmitButton
              label={status === 'published' ? 'Save and publish' : 'Save'}
              pendingLabel="Saving…"
              className="w-full"
            />

            {post?.status === 'published' && (
              <Link
                href={`/insights/${post.slug}`}
                target="_blank"
                className="block text-center text-sm text-brand-strong underline decoration-brand/30 underline-offset-4"
              >
                View live article ↗
              </Link>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Organisation
            </h2>

            <Field label="Category" name="category_id" error={errors.category_id}>
              <select
                {...fieldAria('category_id', undefined, errors.category_id)}
                defaultValue={post?.category_id ?? ''}
                className={controlClass}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Tags"
              name="tags"
              error={errors.tags}
              hint="Comma separated. New tags are created automatically."
            >
              <input
                {...fieldAria('tags', 'tags', errors.tags)}
                type="text"
                defaultValue={post?.tags.map((tag) => tag.name).join(', ') ?? ''}
                className={controlClass}
              />
            </Field>

            <Field label="Author name" name="author_name" error={errors.author_name}>
              <input
                {...fieldAria('author_name', undefined, errors.author_name)}
                type="text"
                maxLength={120}
                defaultValue={post?.author_name ?? 'Softronics'}
                className={controlClass}
              />
            </Field>
          </div>

          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Media and SEO
            </h2>

            <ImageField
              label="Featured image"
              name="featured_image_url"
              defaultValue={post?.featured_image_url}
              media={media}
              error={errors.featured_image_url}
            />

            <Field
              label="SEO title"
              name="seo_title"
              error={errors.seo_title}
              hint="Falls back to the article title."
            >
              <input
                {...fieldAria('seo_title', 'seo_title', errors.seo_title)}
                type="text"
                maxLength={200}
                defaultValue={post?.seo_title ?? ''}
                className={controlClass}
              />
            </Field>

            <Field
              label="SEO description"
              name="seo_description"
              error={errors.seo_description}
              hint="Aim for 140 to 160 characters."
            >
              <textarea
                {...fieldAria('seo_description', 'seo_description', errors.seo_description)}
                rows={3}
                maxLength={320}
                defaultValue={post?.seo_description ?? ''}
                className={`${controlClass} resize-y`}
              />
            </Field>
          </div>
        </aside>
      </div>
    </form>
  );
}
