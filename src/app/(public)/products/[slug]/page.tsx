import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { Section } from '@/components/site/section';
import { CtaBand } from '@/components/site/cta-band';
import { ProductStatusBadge } from '@/components/site/status-badge';
import { getProductSlugs, getPublishedProductBySlug } from '@/lib/db/products';
import { getSettings } from '@/lib/db/settings';
import { PRODUCT_STATUS } from '@/lib/constants';
import { formatDate, truncate } from '@/lib/utils';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

export const revalidate = 300;
export const dynamicParams = true;

/** Pre-renders published products at build time; new ones render on demand. */
export async function generateStaticParams() {
  const products = await getProductSlugs();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    return { title: 'Product not found', robots: { index: false, follow: false } };
  }

  const description =
    product.seo_description ??
    product.short_description ??
    `${product.name}: ${PRODUCT_STATUS[product.status].label}.`;

  return pageMetadata({
    title: product.seo_title ?? product.name,
    description: truncate(description, 300),
    path: `/products/${product.slug}`,
    image: product.image_url ?? product.logo_url ?? null,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, cta] = await Promise.all([
    getPublishedProductBySlug(slug),
    getSettings('home_cta'),
  ]);

  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    applicationCategory: product.category ?? 'BusinessApplication',
    description: product.short_description ?? undefined,
    url: absoluteUrl(`/products/${product.slug}`),
    creator: { '@type': 'Organization', name: 'Softronics' },
  };

  return (
    <>
      <Section space="sm" className="border-b border-line">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
            <li>
              <Link href="/products" className="transition-colors hover:text-ink">
                Products
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-muted">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4">
              {product.logo_url && (
                <Image
                  src={product.logo_url}
                  alt={`${product.name} logo`}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-lg border border-line object-contain"
                  unoptimized
                />
              )}
              <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.028em] text-ink md:text-[2.75rem]">
                {product.name}
              </h1>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ProductStatusBadge status={product.status} />
              {product.category && (
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
                  {product.category}
                </span>
              )}
              <span className="font-mono text-[0.6875rem] text-faint">
                Updated {formatDate(product.updated_at)}
              </span>
            </div>

            {product.short_description && (
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">
                {product.short_description}
              </p>
            )}
          </div>

          {(product.cta_url || product.website_url) && (
            <div className="flex shrink-0 flex-col gap-3">
              {product.cta_url && (
                <ButtonLink href={product.cta_url}>{product.cta_label ?? 'Get in touch'}</ButtonLink>
              )}
              {product.website_url && (
                <a
                  href={product.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line px-5 text-[0.9375rem] text-ink transition-colors hover:bg-raised"
                >
                  Visit website
                </a>
              )}
            </div>
          )}
        </div>
      </Section>

      <Section space="md">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div>
            {product.image_url && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-xl border border-line bg-raised">
                <Image
                  src={product.image_url}
                  alt={`${product.name} interface`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {product.description ? (
              <Markdown content={product.description} />
            ) : (
              <p className="max-w-prose leading-relaxed text-muted">
                A fuller description of {product.name} is being written. In the meantime, contact us
                for details on scope and timing.
              </p>
            )}
          </div>

          {product.features.length > 0 && (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
                Planned scope
              </h2>
              <ul className="mt-4 space-y-3 border-t border-line pt-4">
                {product.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink/85">
                    <span
                      aria-hidden="true"
                      className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-faint">
                Scope reflects current intent for a product with status:{' '}
                {PRODUCT_STATUS[product.status].label.toLowerCase()}. It may change.
              </p>
            </aside>
          )}
        </div>
      </Section>

      <CtaBand settings={cta} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
