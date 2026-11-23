import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types/database';
import { ProductStatusBadge } from './status-badge';

/** Softronics' own mark, used as the icon for any product without its own logo yet. */
const FALLBACK_ICON = '/brand/softronics-mark.png';

/**
 * The app icon: the product's real logo on a solid rounded square, or the
 * Softronics mark until one is uploaded for this product.
 */
function ProductIcon({ product }: { product: Product }) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-paper shadow-md ring-1 ring-white/20 md:h-14 md:w-14">
      <Image
        src={product.logo_url ?? FALLBACK_ICON}
        alt={`${product.name} logo`}
        fill
        sizes="56px"
        className="object-contain p-2"
        unoptimized
      />
    </div>
  );
}

/**
 * Banner with a caption bar anchored inside it — icon, name and category
 * together, never straddling the image edge (the liteapks/Spotify pattern).
 * Falls back to a soft brand glow when there's no cover image yet.
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
        <div className="h-full w-full bg-[radial-gradient(70%_70%_at_50%_40%,oklch(var(--brand)/0.18),transparent_75%)]" />
      )}

      {/* scrim so the caption bar stays legible over any image */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 md:p-5">
        <ProductIcon product={product} />
        <div className="min-w-0">
          <h3 className="truncate text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-white md:text-[1.25rem]">
            {product.name}
          </h3>
          {product.category && (
            <p className="truncate text-sm font-medium text-white/80">{product.category}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Product card: banner with icon + name + category inside it, then status,
 * description and a "Learn more" link below.
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
        <ProductStatusBadge status={product.status} className="self-start" />

        {product.short_description && (
          <p className="mt-3 line-clamp-2 text-[1.0625rem] leading-relaxed text-muted">
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
