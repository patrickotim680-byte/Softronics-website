import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/database';
import { ProductStatusBadge } from './status-badge';

/** Full product card used on the Products page. Wrap it in an <li>. */
export function ProductRow({ product }: { product: Product }) {
  const href = `/products/${product.slug}`;

  return (
    <Link href={href} className="card card-lift group flex h-full flex-col p-8 md:p-10">
      <div className="flex items-start gap-4">
        {product.logo_url ? (
          <Image
            src={product.logo_url}
            alt={`${product.name} logo`}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-2xl bg-raised object-contain"
            unoptimized
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <ProductStatusBadge status={product.status} />
          {product.category && <span className="text-sm text-faint">{product.category}</span>}
        </div>
      </div>

      <h3 className="mt-6 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-[2rem]">
        {product.name}
      </h3>

      {product.short_description && (
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-muted">
          {product.short_description}
        </p>
      )}

      {product.features.length > 0 && (
        <ul className="mt-5 space-y-1.5 text-[0.9375rem] text-ink/80">
          {product.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}

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
