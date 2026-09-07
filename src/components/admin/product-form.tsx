'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveProductAction } from '@/lib/actions/products';
import { idleState } from '@/lib/actions/types';
import { PRODUCT_STATUS } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { Alert } from '@/components/ui/alert';
import { Field, controlClass, fieldAria } from '@/components/ui/field';
import { SubmitButton } from '@/components/ui/submit-button';
import { ImageField } from './image-field';
import { MarkdownEditor } from './markdown-editor';
import type { MediaItem, Product, ProductStatus } from '@/types/database';

interface ProductFormProps {
  product?: Product;
  media: MediaItem[];
}

export function ProductForm({ product, media }: ProductFormProps) {
  const [state, formAction] = useActionState(saveProductAction, idleState);
  const errors = state.errors ?? {};

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');

  const effectiveSlug = slug.length > 0 ? slug : slugify(name);

  return (
    <form action={formAction} className="space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.status === 'error' && state.message && (
        <Alert tone="error" title="Not saved">
          <p>{state.message}</p>
        </Alert>
      )}
      {state.status === 'success' && state.message && (
        <Alert tone="success">
          <p>
            {state.message}{' '}
            {product?.is_published && (
              <Link href={`/products/${product.slug}`} target="_blank">
                View public page
              </Link>
            )}
          </p>
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
            hint={`Public URL: /products/${effectiveSlug || 'your-product'}`}
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
            label="Short description"
            name="short_description"
            error={errors.short_description}
            hint="One or two sentences. Used on the products index and the homepage."
          >
            <textarea
              {...fieldAria('short_description', 'short_description', errors.short_description)}
              rows={3}
              maxLength={320}
              defaultValue={product?.short_description ?? ''}
              className={`${controlClass} resize-y`}
            />
          </Field>

          <MarkdownEditor
            label="Full description"
            name="description"
            rows={16}
            defaultValue={product?.description ?? ''}
            error={errors.description}
            hint="Markdown. Shown on the product detail page."
          />

          <Field
            label="Features"
            name="features"
            error={errors.features}
            hint="One per line. Rendered as the scope list on the product page."
          >
            <textarea
              {...fieldAria('features', 'features', errors.features)}
              rows={7}
              defaultValue={product?.features.join('\n') ?? ''}
              className={`${controlClass} resize-y font-mono text-sm`}
            />
          </Field>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Status and visibility
            </h2>

            <Field label="Status" name="status" required error={errors.status}>
              <select
                {...fieldAria('status', undefined, errors.status)}
                defaultValue={product?.status ?? 'concept'}
                className={controlClass}
              >
                {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((value) => (
                  <option key={value} value={value}>
                    {PRODUCT_STATUS[value].label}
                  </option>
                ))}
              </select>
            </Field>

            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={product?.is_published ?? false}
                className="mt-0.5 h-4 w-4 rounded border-line accent-brand focus:ring-2 focus:ring-brand/30"
              />
              <span>
                Published
                <span className="block text-xs text-muted">Visible on the public website.</span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-ink">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={product?.is_featured ?? false}
                className="mt-0.5 h-4 w-4 rounded border-line accent-brand focus:ring-2 focus:ring-brand/30"
              />
              <span>
                Featured
                <span className="block text-xs text-muted">
                  Prioritised in the homepage section.
                </span>
              </span>
            </label>

            <Field
              label="Sort order"
              name="sort_order"
              error={errors.sort_order}
              hint="Lower numbers appear first."
            >
              <input
                {...fieldAria('sort_order', 'sort_order', errors.sort_order)}
                type="number"
                min={0}
                max={9999}
                defaultValue={product?.sort_order ?? 0}
                className={controlClass}
              />
            </Field>

            <SubmitButton label="Save product" pendingLabel="Saving…" className="w-full" />
          </div>

          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Details
            </h2>

            <Field label="Category" name="category" error={errors.category}>
              <input
                {...fieldAria('category', undefined, errors.category)}
                type="text"
                maxLength={80}
                placeholder="Education, Business, Fintech…"
                defaultValue={product?.category ?? ''}
                className={controlClass}
              />
            </Field>

            <Field label="Website URL" name="website_url" error={errors.website_url}>
              <input
                {...fieldAria('website_url', undefined, errors.website_url)}
                type="url"
                defaultValue={product?.website_url ?? ''}
                className={controlClass}
              />
            </Field>

            <Field label="CTA label" name="cta_label" error={errors.cta_label}>
              <input
                {...fieldAria('cta_label', undefined, errors.cta_label)}
                type="text"
                maxLength={80}
                placeholder="Request a demo"
                defaultValue={product?.cta_label ?? ''}
                className={controlClass}
              />
            </Field>

            <Field
              label="CTA link"
              name="cta_url"
              error={errors.cta_url}
              hint="An internal path such as /contact, or a full URL."
            >
              <input
                {...fieldAria('cta_url', 'cta_url', errors.cta_url)}
                type="text"
                defaultValue={product?.cta_url ?? ''}
                className={controlClass}
              />
            </Field>
          </div>

          <div className="space-y-4 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              Media and SEO
            </h2>

            <ImageField
              label="Logo"
              name="logo_url"
              defaultValue={product?.logo_url}
              media={media}
              error={errors.logo_url}
              hint="Square image works best."
            />

            <ImageField
              label="Cover image"
              name="image_url"
              defaultValue={product?.image_url}
              media={media}
              error={errors.image_url}
            />

            <Field label="SEO title" name="seo_title" error={errors.seo_title}>
              <input
                {...fieldAria('seo_title', undefined, errors.seo_title)}
                type="text"
                maxLength={200}
                defaultValue={product?.seo_title ?? ''}
                className={controlClass}
              />
            </Field>

            <Field label="SEO description" name="seo_description" error={errors.seo_description}>
              <textarea
                {...fieldAria('seo_description', undefined, errors.seo_description)}
                rows={3}
                maxLength={320}
                defaultValue={product?.seo_description ?? ''}
                className={`${controlClass} resize-y`}
              />
            </Field>
          </div>
        </aside>
      </div>
    </form>
  );
}
