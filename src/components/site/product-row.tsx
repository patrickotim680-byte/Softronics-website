import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/database';
import { ProductStatusBadge } from './status-badge';

/**
 * The picture at the top of a product card.
 * Order of preference: the cover image, then the logo on a soft brand glow,
 * then the first letter of the name, so a card never looks empty.
 */
function ProductVisual({ product }: { product: Product }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-ink/[0.04]">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={`${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(70%_70%_at_50%_40%,oklch(var(--brand)/0.14),transparent_75%)]">
          {product.logo_url ? (
            <Image
              src={product.logo_url}
              alt={`${product.name} logo`}
              width={112}
              height={112}
              className="h-24 w-24 object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-110 md:h-28 md:w-28"
              unoptimized
            />
          ) : (
            <span
              aria-hidden="true"
              className="text-[5rem] font-semibold tracking-[-0.04em] text-brand/40"
            >
              {product.name.charAt(0)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Product card: picture first, then name, status and one line.
 * Used on the homepage and the Products page. Wrap it in an <li>.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card card-soft card-lift group flex h-full flex-col overflow-hidden"
    >
      <ProductVisual product={product} />
      <div className="flex flex-1 flex-col p-7 md:p-8">
        <ProductStatusBadge status={product.status} className="self-start" />
        <h3 className="mt-4 text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-[1.75rem]">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="mt-2 line-clamp-2 text-[1.0625rem] leading-relaxed text-muted">
            {product.short_description}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[0.9375rem] font-medium text-brand-strong">
          Learn more
          <span
            aria-hidden="true"
            className="transition-transform duration-500 ease-out group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/** Same card under the older names, so existing pages keep working. */
export const ProductRow = ProductCard;
export const ProductLine = ProductCard;
