import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/database';
import { ProductStatusBadge } from './status-badge';

/**
 * Products are presented as full-width rows rather than a grid of identical
 * cards: the number of products is small and each one deserves reading width.
 */
export function ProductRow({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;

  return (
    <article className="group border-t border-line py-8 first:border-t-0 first:pt-0 md:py-10">
      <div className="grid gap-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10">
        <div className="flex items-start gap-4">
          {product.logo_url ? (
            <Image
              src={product.logo_url}
              alt={`${product.name} logo`}
              width={44}
              height={44}
              className="mt-0.5 h-11 w-11 shrink-0 rounded-md border border-line object-contain"
              unoptimized
            />
          ) : null}
          <div>
            <h3 className="text-xl font-semibold tracking-[-0.015em] text-ink">
              <Link
                href={href}
                className="transition-colors duration-150 hover:text-brand-strong focus-visible:text-brand-strong"
              >
                {product.name}
              </Link>
            </h3>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <ProductStatusBadge status={product.status} />
              {product.category && (
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-faint">
                  {product.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          {product.short_description && (
            <p className="max-w-prose text-[1.0625rem] leading-relaxed text-muted">
              {product.short_description}
            </p>
          )}

          {product.features.length > 0 && (
            <ul className="mt-4 grid gap-x-8 gap-y-1.5 text-sm text-ink/80 sm:grid-cols-2">
              {product.features.slice(0, 6).map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-brand" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-strong transition-colors hover:text-brand"
            >
              Details
              <span aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            {product.website_url && (
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                Visit site
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Card used in the homepage "What we're making" grid. Wrap it in an <li>. */
export function ProductLine({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card card-soft card-lift group flex h-full flex-col p-8 md:p-10"
    >
      <ProductStatusBadge status={product.status} className="self-start" />
      <span className="mt-6 block text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-[2rem]">
        {product.name}
      </span>
      <span className="mt-3 block text-[1.0625rem] leading-relaxed text-muted">
        {product.short_description}
      </span>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-[0.9375rem] font-medium text-brand-strong">
        Learn more
        <span
          aria-hidden="true"
          className="transition-transform duration-500 ease-out group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}
