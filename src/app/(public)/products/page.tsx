import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { ProductRow } from '@/components/site/product-row';
import { SetupNotice } from '@/components/site/setup-notice';
import { listPublishedProducts } from '@/lib/db/products';
import { getSettings } from '@/lib/db/settings';
import { missingSupabaseEnv } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description:
    'Software products Softronics is developing, with current and honest status for each one.',
  path: '/products',
});

export default async function ProductsPage() {
  const [products, cta] = await Promise.all([listPublishedProducts(), getSettings('home_cta')]);
  const missing = missingSupabaseEnv();

  return (
    <>
      <Section space="sm" className="border-b border-line">
        <SectionHeading
          as="h1"
          eyebrow="Products"
          title="What we are building, and how far along it is."
          lead="Every entry on this page is managed in the Softronics CMS. Statuses are kept current: concept, research, in development, coming soon, or available."
        />
      </Section>

      <Section space="md">
        {missing.length > 0 && (
          <div className="mb-8">
            <SetupNotice missing={missing} context="This page" />
          </div>
        )}

        {products.length > 0 ? (
          <div>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No products published yet"
            description="This page is driven by the database. When an administrator publishes a product in the dashboard it appears here immediately, with no code change."
            action={
              <ButtonLink href="/contact" size="sm">
                Talk to Softronics
              </ButtonLink>
            }
          />
        )}
      </Section>

      <CtaBand settings={cta} />
    </>
  );
}
