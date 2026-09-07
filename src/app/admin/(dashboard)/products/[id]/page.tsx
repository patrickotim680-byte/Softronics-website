import { notFound } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/page-header';
import { ProductForm } from '@/components/admin/product-form';
import { DeleteAction } from '@/components/admin/row-actions';
import { ProductStatusBadge } from '@/components/site/status-badge';
import { deleteProductAction } from '@/lib/actions/products';
import { getProductById } from '@/lib/db/products';
import { listMedia } from '@/lib/db/media';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const [product, media] = await Promise.all([getProductById(id), listMedia(60)]);

  if (!product) notFound();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Edit product"
        description={`Last updated ${formatDateTime(product.updated_at)}`}
        actions={
          <>
            <ProductStatusBadge status={product.status} />
            <DeleteAction
              action={deleteProductAction}
              id={product.id}
              confirmMessage={`Delete "${product.name}"? This cannot be undone.`}
            />
          </>
        }
      />

      {saved && (
        <Alert tone="success">
          <p>Product created. You are now editing it.</p>
        </Alert>
      )}

      <ProductForm product={product} media={media} />
    </div>
  );
}
