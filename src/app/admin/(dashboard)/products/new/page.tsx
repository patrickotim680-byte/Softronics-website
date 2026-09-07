import { PageHeader } from '@/components/admin/page-header';
import { ProductForm } from '@/components/admin/product-form';
import { listMedia } from '@/lib/db/media';

export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  const media = await listMedia(60);

  return (
    <div className="space-y-7">
      <PageHeader
        title="New product"
        description="Use an honest status. Leave it unpublished until the entry is ready to be seen."
      />
      <ProductForm media={media} />
    </div>
  );
}
