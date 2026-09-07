import type { Metadata } from 'next';
import { publicEnv } from '@/lib/env';
import { SITE } from '@/lib/constants';

export const siteUrl = publicEnv.siteUrl.replace(/\/$/, '');

export function absoluteUrl(path = '/'): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
}

/** Builds canonical, Open Graph and Twitter metadata for a page. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? '/og/og-default.png';

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${SITE.name}: ${title}` }],
      ...(type === 'article'
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/** JSON-LD for the organisation. Only verifiable facts are included. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: siteUrl,
    logo: absoluteUrl('/brand/softronics-mark-512.png'),
    description: SITE.description,
    slogan: SITE.tagline,
    email: publicEnv.contactEmail,
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  updatedAt: string;
  author: string | null;
  image?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(`/insights/${input.slug}`),
    datePublished: input.publishedAt ?? undefined,
    dateModified: input.updatedAt,
    author: { '@type': 'Organization', name: input.author ?? SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/softronics-mark-512.png') },
    },
    image: input.image ? [input.image] : [absoluteUrl('/og/og-default.png')],
  };
}
