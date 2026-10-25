import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Section, SectionHeading } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { ProductRow } from '@/components/site/product-row';
import { Reveal } from '@/components/site/reveal';
import { SetupNotice } from '@/components/site/setup-notice';
import { listPublishedProducts } from '@/lib/db/products';
import { getSettings } from '@/lib/db/settings';
import { missingSupabaseEnv } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'Products',
  description: 'Software products from Softronics, built for African organizations.',
  path: '/products',
});

export default async function ProductsPage() {
  const [products, cta] = await Promise.all([listPublishedProducts(), getSettings('home_cta')]);
  const missing = missingSupabaseEnv();

  return (
    <>
      <Section space="lg">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Products"
          title="Software for African organizations."
          lead="Each product shows where it is today: in the works, coming soon or available."
        />
      </Section>

      <Section space="md" className="bg-raised">
        {missing.length > 0 && (
          <div className="mb-8">
            <SetupNotice missing={missing} context="This page" />
          </div>
        )}

        {products.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {products.map((product, index) => (
              <li key={product.id}>
                <Reveal delay={(index % 2) * 120} className="h-full">
                  <ProductRow product={product} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Products are coming soon"
            description="Our first products are on the way. In the meantime, tell us about a problem you would like solved."
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
