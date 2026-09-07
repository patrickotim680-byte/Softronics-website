import type { MetadataRoute } from 'next';
import { getPostSlugs } from '@/lib/db/posts';
import { getProductSlugs } from '@/lib/db/products';
import { absoluteUrl } from '@/lib/seo';

export const revalidate = 3600;

/**
 * Generated at /sitemap.xml. Static routes are always listed; CMS routes are
 * read from the database, so publishing an article adds it automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/solutions'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/products'), changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/insights'), changeFrequency: 'weekly', priority: 0.7 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.6 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/terms'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [posts, products] = await Promise.all([getPostSlugs(), getProductSlugs()]);

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: absoluteUrl(`/insights/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: new Date(product.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
