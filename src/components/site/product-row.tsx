import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/database';
import { ProductStatusBadge } from './status-badge';

/**
 * The banner across the top of a product card — the cover image if there is
 * one, otherwise a soft brand glow so the card never looks empty.
 */
function ProductBanner({ product }: { product: Product }) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-ink/[0.04]">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          unoptimized
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(70%_70%_at_50%_40%,oklch(var(--brand)/0.16),transparent_75%)]" />
      )}
      {/* subtle fade so a dark logo mark stays legible when it overlaps the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
    </div>
  );
}

/**
 * The app icon: the real product logo on a rounded square, overlapping the
 * banner like a store listing. Falls back to the product's first letter.
 */
function ProductIcon({ product }: { product: Product }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-paper shadow-lg ring-1 ring-ink/[0.06] md:h-16 md:w-16">
      {product.logo_url ? (
        <Image
          src={product.logo_url}
          alt={`${product.name} logo`}
          fill
          sizes="64px"
          className="object-contain p-2"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[oklch(var(--brand)/0.12)]">
          <span aria-hidden="true" className="text-xl font-semibold text-brand-strong">
            {product.name.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Product card: banner image up top, real app icon overlapping it bottom-left
 * next to the name, then status, description and a "Learn more" link.
 * Used on the homepage and the Products page. Wrap it in an <li>.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card card-soft card-lift group flex h-full flex-col overflow-hidden"
    >
      <ProductBanner product={product} />
      <div className="flex flex-1 flex-col p-7 md:p-8">
        <div className="-mt-12 flex items-end gap-4 md:-mt-14">
          <ProductIcon product={product} />
          <div className="min-w-0 pb-1">
            <h3 className="truncate text-[1.375rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-[1.5rem]">
              {product.name}
            </h3>
            {product.category && (
              <p className="truncate text-sm font-medium text-brand-strong">{product.category}</p>
            )}
          </div>
        </div>

        <ProductStatusBadge status={product.status} className="mt-4 self-start" />

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
