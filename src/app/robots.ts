import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

/** Generated at /robots.txt. The admin area is never indexable. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
