import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteAction, ToggleAction } from '@/components/admin/row-actions';
import { ProductStatusBadge } from '@/components/site/status-badge';
import { deleteProductAction, toggleProductPublishedAction } from '@/lib/actions/products';
import { listAllProducts } from '@/lib/db/products';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const [{ deleted }, products] = await Promise.all([searchParams, listAllProducts()]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Products"
        description="Drives the public /products page and the homepage section. Unpublished products are invisible to visitors."
        actions={
          <ButtonLink href="/admin/products/new" size="sm">
            New product
          </ButtonLink>
        }
      />

      {deleted && (
        <Alert tone="success">
          <p>Product deleted.</p>
        </Alert>
      )}

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create a product, set an honest status, and publish it when you are ready for it to be public."
          action={<ButtonLink href="/admin/products/new" size="sm">New product</ButtonLink>}
        />
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink/20"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-base font-semibold tracking-[-0.015em] text-ink hover:text-brand-strong"
                    >
                      {product.name}
                    </Link>
                    <ProductStatusBadge status={product.status} />
                    {product.is_featured && <Badge tone="blue">Featured</Badge>}
                    {!product.is_published && <Badge tone="amber">Unpublished</Badge>}
                  </div>
                  <p className="mt-1 font-mono text-[0.6875rem] text-faint">/products/{product.slug}</p>
                  {product.short_description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                      {product.short_description}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-[0.6875rem] text-faint">
                    Updated {formatDateTime(product.updated_at)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  {product.is_published && (
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="text-xs font-medium text-muted underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      View
                    </Link>
                  )}
                  <ToggleAction
                    action={toggleProductPublishedAction}
                    id={product.id}
                    label={product.is_published ? 'Unpublish' : 'Publish'}
                  />
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex h-9 items-center rounded-md border border-line px-3 text-xs font-medium text-ink hover:bg-raised"
                  >
                    Edit
                  </Link>
                  <DeleteAction
                    action={deleteProductAction}
                    id={product.id}
                    confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
